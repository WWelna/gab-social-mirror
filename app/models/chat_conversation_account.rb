# frozen_string_literal: true
# == Schema Information
#
# Table name: chat_conversation_accounts
#
#  id                             :bigint(8)        not null, primary key
#  account_id                     :bigint(8)
#  chat_conversation_id           :bigint(8)
#  participant_account_ids        :bigint(8)        default([]), not null, is an Array
#  is_hidden                      :boolean          default(FALSE), not null
#  is_approved                    :boolean          default(FALSE), not null
#  created_at                     :datetime         not null
#  updated_at                     :datetime         not null
#  unread_count                   :bigint(8)        default(0), not null
#  chat_message_expiration_policy :string
#  is_muted                       :boolean          default(FALSE), not null
#  is_pinned                      :boolean          default(FALSE), not null
#  left_group_chat_at             :datetime
#

# : todo : max per account
class ChatConversationAccount < ApplicationRecord
  include Paginable

  EXPIRATION_POLICIES = [
    { name: 'five_minutes', db: '1', duration: 5.minutes },
    { name: 'one_hour', db: '2', duration: 1.hour },
    { name: 'six_hours', db: '3', duration: 6.hours },
    { name: 'one_day', db: '4', duration: 1.day },
    { name: 'three_days', db: '5', duration: 3.days },
    { name: 'one_week', db: '6', duration: 1.week },
  ].freeze

  belongs_to :account
  belongs_to :chat_conversation

  validates_with ChatConversationAccountLimitValidator

  scope :by_recent_message, -> { 
    joins(:chat_conversation).order('chat_conversations.last_chat_message_sent_at desc')
  }
  scope :active, -> { where(is_hidden: false, is_approved: true, left_group_chat_at: nil) }
  scope :requests, -> { where(is_hidden: false, is_approved: false) }
  scope :with_last_message, -> {
    joins(:chat_conversation).where('chat_conversations.last_chat_message_id IS NOT NULL')
  }

  def self.find_expiration_policy(atts)
    return unless atts.present?

    EXPIRATION_POLICIES.detect do |policy|
      atts.all? { |k,v| policy[k] == v }
    end
  end

  def self.expiration_policy_db(atts)
    expiration_policy = find_expiration_policy(atts)
    expiration_policy[:db] if expiration_policy
  end

  def participant_accounts
    if participant_account_ids.empty?
      [account]
    else
      participants = Account.where(id: participant_account_ids)
      participants.empty? ? [account] : participants
    end
  end

  def chat_message_expiration_policy_name
    expiration_policy[:name] if expiration_policy
  end

  def chat_message_expiration_policy_duration
    expiration_policy[:duration] if expiration_policy
  end

  def is_group_chat?
    participant_account_ids.size > 1
  end

  private

  def expiration_policy
    self.class.find_expiration_policy(db: chat_message_expiration_policy)
  end

end
