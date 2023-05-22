# frozen_string_literal: true
# == Schema Information
#
# Table name: notifications
#
#  id              :bigint(8)        not null, primary key
#  activity_id     :bigint(8)        not null
#  activity_type   :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  account_id      :bigint(8)        not null
#  from_account_id :bigint(8)        not null
#

class Notification < ApplicationRecord
  include Paginable
  include Cacheable

  # : todo : enums, 1,2,3,4,5,...
  TYPE_CLASS_MAP = {
    mention:        'Mention',
    reblog:         'Status',
    follow:         'Follow',
    follow_request: 'FollowRequest',
    favourite:      'Favourite',
    poll:           'Poll',
    group_moderation_event: 'GroupModerationEvent',
    comment_mention: 'CommentMention',
    comment_reaction: 'CommentReaction',
  }.freeze

  STATUS_INCLUDES = [:account, :application, :preloadable_poll, :media_attachments, :tags, active_mentions: :account, reblog: [:account, :application, :preloadable_poll, :media_attachments, :tags, active_mentions: :account]].freeze

  belongs_to :account, optional: true
  belongs_to :from_account, class_name: 'Account', optional: true
  belongs_to :activity, polymorphic: true, optional: true

  belongs_to :mention,        foreign_type: 'Mention',       foreign_key: 'activity_id', optional: true
  belongs_to :status,         foreign_type: 'Status',        foreign_key: 'activity_id', optional: true
  belongs_to :follow,         foreign_type: 'Follow',        foreign_key: 'activity_id', optional: true
  belongs_to :follow_request, foreign_type: 'FollowRequest', foreign_key: 'activity_id', optional: true
  belongs_to :favourite,      foreign_type: 'Favourite',     foreign_key: 'activity_id', optional: true
  belongs_to :poll,           foreign_type: 'Poll',          foreign_key: 'activity_id', optional: true
  belongs_to :group_moderation_event, foreign_type: 'GroupModerationEvent', foreign_key: 'activity_id', optional: true
  belongs_to :comment_mention, foreign_type: 'CommentMention', foreign_key: 'activity_id', optional: true
  belongs_to :comment_reaction, foreign_type: 'CommentReaction', foreign_key: 'activity_id', optional: true

  validates :account_id, uniqueness: { scope: [:activity_type, :activity_id] }
  validates :activity_type, inclusion: { in: TYPE_CLASS_MAP.values }

  scope :latest, -> { where(created_at: 7.days.ago..) }
  scope :browserable, ->(exclude_types = [], from_account_id = nil, only_verified = false, only_following = false, current_account) {
    types = TYPE_CLASS_MAP.values - activity_types_from_types(exclude_types + [:follow_request])

    scope = all
    scope = where(from_account_id: from_account_id) if from_account_id.present?
    scope = scope.where(activity_type: types) unless exclude_types.empty?
    scope = scope.joins(:from_account).where(accounts: { is_verified: true }) if only_verified
    scope = scope.where('from_account_id IN (SELECT target_account_id FROM follows WHERE account_id = ?)', current_account.id) if only_following
    # exclude notifications from blocked accounts in both directions
    scope = scope.where('from_account_id NOT IN (SELECT target_account_id FROM blocks WHERE account_id = ?)', current_account.id)
    scope = scope.where('from_account_id NOT IN (SELECT account_id FROM blocks WHERE target_account_id = ?)', current_account.id)

    scope
  }

  cache_associated :from_account, status: STATUS_INCLUDES, mention: [status: STATUS_INCLUDES], favourite: [:account, status: STATUS_INCLUDES], follow: :account, poll: [status: STATUS_INCLUDES]

  def type
    @type ||= TYPE_CLASS_MAP.invert[activity_type].to_sym
  end

  def target_status
    case type
    when :reblog
      return status if status&.quote?
      status&.reblog
    when :favourite
      favourite&.status
    when :mention
      mention&.status
    when :poll
      poll&.status
    when :group_moderation_event
      group_moderation_event&.status
    end
  end

  def target_comment
    case type
    when :comment_reaction
      comment_reaction&.comment
    when :comment_mention
      comment_mention&.comment
    end
  end

  def group_id
    case type
    when :group_moderation_event
      group_moderation_event&.group_id
    end
  end

  def group_name
    case type
    when :group_moderation_event
      if !group_moderation_event.nil?
        group = Group.find(group_moderation_event.group_id)
        group&.title || 'A group'
      else
        'A group'
      end
    end
  end

  def approved
    case type
    when :group_moderation_event
      group_moderation_event&.approved
    end
  end

  def rejected
    case type
    when :group_moderation_event
      group_moderation_event&.rejected
    end
  end

  def removed
    case type
    when :group_moderation_event
      group_moderation_event&.removed
    end
  end

  def acted_at
    case type
    when :group_moderation_event
      group_moderation_event&.acted_at
    end
  end 
  
  def browserable?
    type != :follow_request
  end

  class << self
    def cache_ids
      select(:id, :updated_at, :activity_type, :activity_id)
    end

    def reload_stale_associations!(cached_items)
      account_ids = (cached_items.map(&:from_account_id) + cached_items.map { |item| item.target_status&.account_id }.compact).uniq

      return if account_ids.empty?

      accounts = Account.where(id: account_ids).includes(:account_stat).each_with_object({}) { |a, h| h[a.id] = a }

      cached_items.each do |item|
        item.from_account = accounts[item.from_account_id]
        item.target_status.account = accounts[item.target_status.account_id] if item.target_status
      end
    end

    def activity_types_from_types(types)
      types.map { |type| TYPE_CLASS_MAP[type.to_sym] }.compact
    end
  end

  after_initialize :set_from_account
  before_validation :set_from_account

  private

  def set_from_account
    return unless new_record?

    case activity_type
    when 'Status', 'Follow', 'Favourite', 'FollowRequest', 'Poll', 'CommentReaction'
      self.from_account_id = activity&.account_id
    when 'Mention'
      self.from_account_id = activity&.status&.account_id
    when 'CommentMention'
      self.from_account_id = activity&.comment&.account_id
    when 'GroupModerationEvent'
      self.from_account_id = activity&.account_id
    end
  end
end
