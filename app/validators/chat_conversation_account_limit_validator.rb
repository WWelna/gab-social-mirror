# frozen_string_literal: true

class ChatConversationAccountLimitValidator < ActiveModel::Validator
  CHAT_CONVERSATION_ACCOUNT_LIMITS = {
    PRO: {
      weekly: 200,
      daily: 40,
      hourly: 10,
      semi_hourly: 6,
      minute: 3,
    },
    BASE: {
      weekly: 100,
      daily: 25,
      hourly: 10,
      semi_hourly: 5,
      minute: 2,
    },
    NEW: {
      weekly: 40,
      daily: 10,
      hourly: 5,
      semi_hourly: 5,
      minute: 1,
    }
  }

  def validate(chatConversationAccount)
    return if chatConversationAccount.account.nil?
    
    # continue if this chatConversationAccount was created
    # automatically by means of another user starting a conversation
    # - for example, if I, as a normal user with a confirmed email want to chat with
    # a use who has exceeded the existing chat limits or has not confirmed their email
    # i can do that.
    # THIS ONLY WORKS FOR 1:1 CONVERSATIONS.
    # WILL BE SPAMMED IF DOING THIS WITH GROUPS.
    # but... we're gonna do it anyways
    numberOfExistingParticipantsInThisConversation = ChatConversationAccount.where(
      chat_conversation: chatConversationAccount.chat_conversation
    ).count
    return if numberOfExistingParticipantsInThisConversation > 0

    # continue if new only
    return unless chatConversationAccount.created_at.nil?

    # not allowed if not confirmed
    if !chatConversationAccount.account.user&.confirmed?
      chatConversationAccount.errors.add(:base, 'You must confirm your email before starting any chat conversations')
      return
    end

    @key = :BASE
    if chatConversationAccount.account.is_pro?
      @key = :PRO
    elsif chatConversationAccount.account.created_at < 7.days.ago
      @key = :NEW
    end

    chatConversationAccount.errors.add(:base, 'Weekly chat conversation limit reached. Please slow down.') if weekly_limit_reached?(chatConversationAccount.account)
    chatConversationAccount.errors.add(:base, 'Daily chat conversation limit reached. Please slow down.') if daily_limit_reached?(chatConversationAccount.account)
    chatConversationAccount.errors.add(:base, 'Hourly chat conversation limit reached. Please slow down.') if hourly_limit_reached?(chatConversationAccount.account)
    chatConversationAccount.errors.add(:base, 'Semi-hourly chat conversation limit reached. Please slow down.') if semi_hourly_limit_reached?(chatConversationAccount.account)
    chatConversationAccount.errors.add(:base, 'Minute-to-minute chat conversation limit reached. Please slow down.') if minutely_limit_reached?(chatConversationAccount.account)
  end

  private

  def weekly_limit_reached?(account)
    account.chat_conversation_accounts.where('created_at > ?', 7.days.ago).count >= CHAT_CONVERSATION_ACCOUNT_LIMITS[@key][:weekly]
  end

  def daily_limit_reached?(account)
    account.chat_conversation_accounts.where('created_at > ?', 1.day.ago).count >= CHAT_CONVERSATION_ACCOUNT_LIMITS[@key][:daily]
  end

  def hourly_limit_reached?(account)
    account.chat_conversation_accounts.where('created_at > ?', 1.hour.ago).count >= CHAT_CONVERSATION_ACCOUNT_LIMITS[@key][:hourly]
  end

  def semi_hourly_limit_reached?(account)
    account.chat_conversation_accounts.where('created_at > ?', 30.minutes.ago).count >= CHAT_CONVERSATION_ACCOUNT_LIMITS[@key][:semi_hourly]
  end

  def minutely_limit_reached?(account)
    account.chat_conversation_accounts.where('created_at > ?', 1.minute.ago).count >= CHAT_CONVERSATION_ACCOUNT_LIMITS[@key][:minute]
  end

end
