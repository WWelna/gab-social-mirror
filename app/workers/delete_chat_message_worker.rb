# frozen_string_literal: true

class DeleteChatMessageWorker
  include Sidekiq::Worker

  sidekiq_options lock: :until_executed, queue: 'pull', retry: 2

  def perform(chat_message_id)
    return if chat_message_id.nil?
    message = ChatMessage.find_by(id: chat_message_id)
    return if message.nil?
    DeleteChatMessageService.new.call(message)
  end
end
