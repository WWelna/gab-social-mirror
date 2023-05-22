# frozen_string_literal: true

class REST::NotificationSerializer < ActiveModel::Serializer
  attributes :id, :type, :created_at

  belongs_to :from_account, key: :account, serializer: REST::AccountSerializer
  belongs_to :target_status, key: :status, if: :status_type?, serializer: REST::StatusSerializer
  belongs_to :target_comment, key: :comment, if: :comment_mention_type?, serializer: REST::CommentSerializer
  belongs_to :favourite, key: :favourite, if: :fav_type?, serializer: REST::FavouriteSerializer
  belongs_to :comment_reaction, key: :comment_reaction, if: :comment_reaction_type?, serializer: REST::CommentReactionSerializer
  belongs_to :group_moderation_event, key: :group_moderation_event, if: :gme_type?, serializer: REST::GroupModerationEventSerializer

  def id
    object.id.to_s
  end

  def status_type?
    [:favourite, :reblog, :mention, :poll].include?(object.type)
  end

  def fav_type?
    [:favourite].include?(object.type)
  end

  def comment_reaction_type?
    [:comment_reaction].include?(object.type)
  end

  def comment_mention_type?
    [:comment_mention, :comment_reaction].include?(object.type)
  end

  def gme_type?
    [:group_moderation_event].include?(object.type)
  end

end
