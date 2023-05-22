# frozen_string_literal: true

class DeleteChatMessageWorker
  include Sidekiq::Worker

  sidekiq_options unique: :until_executed

  def perform(chat_message_id)
    return if chat_message_id.nil?
    message = ChatMessage.find_by(id: chat_message_id)
    return if message.nil?
    DeleteChatMessageService.new.call(message)
  end
end
