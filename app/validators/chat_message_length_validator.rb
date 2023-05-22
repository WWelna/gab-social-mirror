# frozen_string_literal: true

class ChatMessageLengthValidator < ActiveModel::Validator
  MAX_CHARS = 1600

  def validate(chat_message)
    chat_message.errors.add(:text, I18n.t('statuses.over_character_limit', max: MAX_CHARS)) if chat_message.text.length > MAX_CHARS
    if chat_message.text.length == 0 && chat_message.media_attachments.length == 0
      chat_message.errors.add(:text, 'Cannot send empty chat message')
    end
  end
end
