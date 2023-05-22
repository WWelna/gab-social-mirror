# frozen_string_literal: true

module AccountInteractions
  extend ActiveSupport::Concern

  class_methods do
    def following_map(target_account_ids, account_id)
      Follow.where(target_account_id: target_account_ids, account_id: account_id).each_with_object({}) do |follow, mapping|
        mapping[follow.target_account_id] = {
          reblogs: follow.show_reblogs?,
        }
      end
    end

    def followed_by_map(target_account_ids, account_id)
      follow_mapping(Follow.where(account_id: target_account_ids, target_account_id: account_id), :account_id)
    end

    def blocking_map(target_account_ids, account_id)
      follow_mapping(Block.where(target_account_id: target_account_ids, account_id: account_id), :target_account_id)
    end

    def blocked_by_map(target_account_ids, account_id)
      follow_mapping(Block.where(account_id: target_account_ids, target_account_id: account_id), :account_id)
    end

    def chat_blocking_map(target_account_ids, account_id)
      follow_mapping(ChatBlock.where(target_account_id: target_account_ids, account_id: account_id), :target_account_id)
    end

    def chat_blocked_by_map(target_account_ids, account_id)
      follow_mapping(ChatBlock.where(account_id: target_account_ids, target_account_id: account_id), :account_id)
    end

    def muting_map(target_account_ids, account_id)
      Mute.where(target_account_id: target_account_ids, account_id: account_id).each_with_object({}) do |mute, mapping|
        mapping[mute.target_account_id] = {
          notifications: mute.hide_notifications?,
        }
      end
    end

    def requested_map(target_account_ids, account_id)
      FollowRequest.where(target_account_id: target_account_ids, account_id: account_id).each_with_object({}) do |follow_request, mapping|
        mapping[follow_request.target_account_id] = {
          reblogs: follow_request.show_reblogs?,
        }
      end
    end

    private

    def follow_mapping(query, field)
      query.pluck(field).each_with_object({}) { |id, mapping| mapping[id] = true }
    end
  end

  included do
    # Follow relations
    has_many :follow_requests, dependent: :destroy
    has_many :unfollows, dependent: :destroy

    has_many :active_relationships,  class_name: 'Follow', foreign_key: 'account_id',        dependent: :destroy
    has_many :passive_relationships, class_name: 'Follow', foreign_key: 'target_account_id', dependent: :destroy

    has_many :following, -> { order('follows.id desc') }, through: :active_relationships,  source: :target_account
    has_many :followers, -> { order('follows.id desc') }, through: :passive_relationships, source: :account

    has_many :group_accounts, inverse_of: :account, dependent: :destroy, source: :account
    has_many :groups, through: :group_accounts
    has_many :group_removed_accounts, inverse_of: :account, dependent: :destroy, source: :account

    # Block relationships
    has_many :block_relationships, class_name: 'Block', foreign_key: 'account_id', dependent: :destroy
    has_many :blocking, -> { order('blocks.id desc') }, through: :block_relationships, source: :target_account
    has_many :blocked_by_relationships, class_name: 'Block', foreign_key: :target_account_id, dependent: :destroy
    has_many :blocked_by, -> { order('blocks.id desc') }, through: :blocked_by_relationships, source: :account
    has_many :blocking_groups, class_name: 'BlockedGroup', foreign_key: :account_id, dependent: :destroy

    # Mute relationships
    has_many :mute_relationships, class_name: 'Mute', foreign_key: 'account_id', dependent: :destroy
    has_many :muting, -> { order('mutes.id desc') }, through: :mute_relationships, source: :target_account
    has_many :muted_by_relationships, class_name: 'Mute', foreign_key: :target_account_id, dependent: :destroy
    has_many :muted_by, -> { order('mutes.id desc') }, through: :muted_by_relationships, source: :account

    has_many :conversation_mutes
    has_many :comment_conversation_mutes

    # Chat block relationships
    has_many :chat_block_relationships, class_name: 'ChatBlock', foreign_key: 'account_id', dependent: :destroy
    has_many :chat_blocking, -> { order('chat_blocks.id desc') }, through: :chat_block_relationships, source: :target_account
    has_many :chat_blocked_by_relationships, class_name: 'ChatBlock', foreign_key: :target_account_id, dependent: :destroy
    has_many :chat_blocked_by, -> { order('chat_blocks.id desc') }, through: :chat_blocked_by_relationships, source: :account
  end

  def follow!(other_account, reblogs: nil, uri: nil)
    reblogs = true if reblogs.nil?

    rel = active_relationships.create_with(show_reblogs: reblogs, uri: uri)
                              .find_or_create_by!(target_account: other_account)

    rel.update!(show_reblogs: reblogs)
    remove_potential_friendship(other_account)

    rel
  end

  def block!(other_account, uri: nil)
    remove_potential_friendship(other_account)
    block_relationships.create_with(uri: uri)
                       .find_or_create_by!(target_account: other_account)
  end

  def chat_block!(other_account)
    chat_block_relationships.find_or_create_by!(target_account: other_account)
  end

  def mute!(other_account, notifications: nil)
    notifications = true if notifications.nil?
    mute = mute_relationships.create_with(hide_notifications: notifications).find_or_create_by!(target_account: other_account)
    remove_potential_friendship(other_account)

    # When toggling a mute between hiding and allowing notifications, the mute will already exist, so the find_or_create_by! call will return the existing Mute without updating the hide_notifications attribute. Therefore, we check that hide_notifications? is what we want and set it if it isn't.
    if mute.hide_notifications? != notifications
      mute.update!(hide_notifications: notifications)
    end

    mute
  end

  def unfollow!(other_account)
    follow = active_relationships.find_by(target_account: other_account)
    follow&.destroy
  end

  def unblock!(other_account)
    block = block_relationships.find_by(target_account: other_account)
    block&.destroy
  end

  def chat_unblock!(other_account)
    block = chat_block_relationships.find_by(target_account: other_account)
    block&.destroy
  end

  def unmute!(other_account)
    mute = mute_relationships.find_by(target_account: other_account)
    mute&.destroy
  end

  def mute_conversation!(conversation)
    conversation_mutes.find_or_create_by!(conversation: conversation)
  end

  def unmute_conversation!(conversation)
    conversation_mute = conversation_mutes.find_by(conversation: conversation)
    conversation_mute&.destroy!
  end

  def mute_comment_conversation!(comment_conversation)
    comment_conversation_mutes.find_or_create_by!(comment_conversation: comment_conversation)
  end

  def unmute_comment_conversation!(comment_conversation)
    comment_conversation_mute = comment_conversation_mutes.find_by(comment_conversation: comment_conversation)
    comment_conversation_mute&.destroy!
  end

  def following?(other_account)
    active_relationships.where(target_account: other_account).exists?
  end

  def blocking?(other_account)
    block_relationships.where(target_account: other_account).exists?
  end

  def chat_blocking?(other_account)
    chat_block_relationships.where(target_account: other_account).exists?
  end

  def chat_blocked_by?(target_account_id, account_id)
    ChatBlock.where(account_id: target_account_id, target_account_id: account_id).exists?
  end

  def muting?(other_account)
    mute_relationships.where(target_account: other_account).exists?
  end

  def muting_notifications?(other_account)
    mute_relationships.where(target_account: other_account, hide_notifications: true).exists?
  end

  def muting_reblogs?(other_account)
    active_relationships.where(target_account: other_account, show_reblogs: false).exists?
  end

  def requested?(other_account)
    follow_requests.where(target_account: other_account).exists?
  end

  def favourited?(status)
    status.proper.favourites.where(account: self).exists?
  end

  def comment_reacted?(comment)
    comment.comment_reactions.where(account: self).exists?
  end

  def comment_reaction_id(comment)
    reaction = comment.comment_reactions.where(account: self).first
    if !reaction.nil?
      return reaction.reaction_id
    end
    nil
  end

  def reaction_id(status)
    fav = status.proper.favourites.where(account: self).first
    if !fav.nil?
      return fav.reaction_id
    end
    nil
  end

  def reaction(status)
    fav = status.proper.favourites.where(account: self).first
    reaction = nil
    if !fav.nil? && !fav.reaction_id.nil?
      reaction = ReactionType.find(fav.reaction_id)
    end
    reaction
  end

  def bookmarked?(status)
    status_bookmarks.where(account: self, status: status).exists?
  end

  def marketplace_listing_saved?(marketplace_listing)
    marketplace_listing_saves.where(account: self, marketplace_listing: marketplace_listing).exists?
  end

  def reblogged?(status)
    status.proper.reblogs.where(account: self).exists?
  end

  def pinned?(status)
    status_pins.where(status: status).exists?
  end

  def muting_conversation?(conversation)
    conversation_mutes.where(conversation: conversation).exists?
  end

  def followers_for_local_distribution
    followers.local
             .joins(:user)
             .where('users.current_sign_in_at > ?', User::ACTIVE_DURATION.ago)
  end

  def lists_for_local_distribution
    lists.joins(account: :user)
         .where('users.current_sign_in_at > ?', User::ACTIVE_DURATION.ago)
  end

  def muting_comment_conversation?(comment_conversation)
    comment_conversation_mutes.where(comment_conversation: comment_conversation).exists?
  end

  private

  def remove_potential_friendship(other_account, mutual = false)
    PotentialFriendshipTracker.remove(id, other_account.id)
    PotentialFriendshipTracker.remove(other_account.id, id) if mutual
  end
end
