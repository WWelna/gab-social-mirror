# frozen_string_literal: true

class ChatMessageLimitValidator < ActiveModel::Validator
  MAX_CHAT_MESSAGES_DAILY_LIMIT = 800
  MAX_CHAT_MESSAGES_HOURLY_LIMIT = 250
  MAX_CHAT_MESSAGES_HALF_HOUR_LIMIT = 100
  MAX_CHAT_MESSAGES_MINUTE_LIMIT = 10

  def validate(chatMessage)
    return if chatMessage.from_account.nil?
    chatMessage.errors.add(:base, 'Daily chat message limit reached. Please slow down.') if daily_limit_reached?(chatMessage.from_account)
    chatMessage.errors.add(:base, 'Hourly chat message limit reached. Please slow down.') if hourly_limit_reached?(chatMessage.from_account)
    chatMessage.errors.add(:base, 'Semi-hourly chat message limit reached. Please slow down.') if half_hour_limit_reached?(chatMessage.from_account)
    chatMessage.errors.add(:base, 'Minute by minute chat message limit reached. Please slow down.') if minute_by_minute_limit_reached?(chatMessage.from_account)
  end

  private

  def daily_limit_reached?(account)
    ChatMessage.where(from_account: account).where('created_at > ?', 1.day.ago).count >= MAX_CHAT_MESSAGES_DAILY_LIMIT
  end

  def hourly_limit_reached?(account)
    ChatMessage.where(from_account: account).where('created_at > ?', 1.hour.ago).count >= MAX_CHAT_MESSAGES_HOURLY_LIMIT
  end

  def half_hour_limit_reached?(account)
    ChatMessage.where(from_account: account).where('created_at > ?', 30.minutes.ago).count >= MAX_CHAT_MESSAGES_HALF_HOUR_LIMIT
  end

  def minute_by_minute_limit_reached?(account)
    ChatMessage.where(from_account: account).where('created_at > ?', 1.minute.ago).count >= MAX_CHAT_MESSAGES_MINUTE_LIMIT
  end

end
