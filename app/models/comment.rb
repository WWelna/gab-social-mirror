# == Schema Information
#
# Table name: comments
#
#  id                      :bigint(8)        not null, primary key
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  account_id              :bigint(8)        not null
#  source                  :integer
#  source_id               :text
#  language                :text             default("en"), not null
#  in_reply_to_id          :bigint(8)
#  in_reply_to_account_id  :bigint(8)
#  text                    :text             default(""), not null
#  reply                   :boolean          default(FALSE)
#  comment_conversation_id :bigint(8)
#  revised_at              :datetime
#  tombstoned_at           :datetime
#

class Comment < ApplicationRecord

  include Paginable
  include Cacheable

  # from Status:
  # If `override_timestamps` is set at creation time, Snowflake ID creation
  # will be based on current time instead of `created_at`
  attr_accessor :override_timestamps

  enum source: [
    :tv_video,
    :trends_url,
  ]
  validates :source, inclusion: { in: sources.keys }

  belongs_to :account, inverse_of: :comments
  belongs_to :comment_conversation, optional: true

  belongs_to :thread, foreign_key: 'in_reply_to_id', class_name: 'Comment', inverse_of: :replies, optional: true

  has_many :comment_reactions, inverse_of: :comment, dependent: :destroy
  has_many :replies, foreign_key: 'in_reply_to_id', class_name: 'Comment', inverse_of: :thread
  has_many :comment_mentions, dependent: :destroy, inverse_of: :comment
  has_many :active_comment_mentions, -> { active }, class_name: 'CommentMention', inverse_of: :comment
  has_many :comment_revisions, class_name: 'CommentRevision', dependent: :destroy

  has_one :comment_stat, inverse_of: :comment

  around_create GabSocial::Snowflake::Callbacks

  validates_with CommentLengthValidator
  validates_with CommentLimitValidator

  before_validation :prepare_contents
  before_validation :set_conversation

  after_create_commit  :increment_counter_caches

  default_scope { recent.not_tombstoned }

  scope :recent, -> { reorder(id: :desc) }
  scope :oldest, -> { reorder(id: :asc) }
  scope :tombstoned,  -> { where.not(tombstoned_at: nil) }
  scope :not_tombstoned,  -> { where(tombstoned_at: nil) }

  class << self
    def reactions_map(comment_id)
      Rails.cache.fetch("reactions_counts:#{comment_id}", expires_in: 4.hours) do
        CommentReaction.where(comment_id: comment_id).group('reaction_id').pluck('reaction_id', Arel.sql('count(*)')).each_with_object({}) { |(reactionId, count), h|
          key = reactionId.nil? ? 1 : reactionId
          if h.has_key?(key)
            h[key] += count
          else
            h[key] = count
          end
        }
      end
    end

    def mutes_map(conversation_ids, account_id)
      CommentConversationMute.select('comment_conversation_id').where(comment_conversation_id: conversation_ids).where(account_id: account_id).each_with_object({}) { |m, h| h[m.comment_conversation_id] = true }
    end

    def replies_count_map(comment_ids)
      return({}) unless comment_ids.present?

      sql = <<-SQL.squish
        SELECT comment_id AS in_reply_to_id, replies_count
        FROM comment_stats
        WHERE comment_id IN (:ids)
      SQL

      return self.connection.query(sanitize_sql([sql, { ids: comment_ids }])).to_h
    end

  end

  def emojis
    return @emojis if defined?(@emojis)

    @emojis = CustomEmoji.from_text(text)
  end
    
  def mark_for_mass_destruction!
    @marked_for_mass_destruction = true
  end

  def marked_for_mass_destruction?
    @marked_for_mass_destruction
  end

  def reply?
    !in_reply_to_id.nil? || attributes['reply']
  end
  
  def tombstoned?
    !tombstoned_at.nil?
  end

  def object_type
    :sourced_comment
  end
  
  def content
    proper.text
  end

  def direct_replies_count
    comment_stat&.replies_count || 0
  end

  def replies_count
    comment_stat&.replies_count || 0
  end

  def reactions_count
    comment_stat&.reactions_count || 0
  end

  def reactions_counts
    self.class.reactions_map(id) || {}
  end

  def increment_count!(key)
    update_comment_stat!(key => public_send(key) + 1)
  end

  def decrement_count!(key)
    update_comment_stat!(key => [public_send(key) - 1, 0].max)
  end

  private

  def update_comment_stat!(attrs)
    return if marked_for_destruction? || destroyed?

    record = comment_stat || build_comment_stat
    record.update(attrs)
  end

  def increment_counter_caches
    thread&.increment_count!(:replies_count) if in_reply_to_id.present?
  end

  def prepare_contents
    text&.strip!
  end

  def set_conversation
    self.reply = !(in_reply_to_id.nil? && thread.nil?) unless reply

    if reply? && !thread.nil?
      self.in_reply_to_account_id = carried_over_reply_to_account_id
      self.comment_conversation_id = thread.comment_conversation_id if comment_conversation_id.nil?
    elsif comment_conversation_id.nil?
      self.comment_conversation = CommentConversation.new
    end
  end

  def carried_over_reply_to_account_id
    if thread.account_id == account_id && thread.reply?
      thread.in_reply_to_account_id
    else
      thread.account_id
    end
  end


end
