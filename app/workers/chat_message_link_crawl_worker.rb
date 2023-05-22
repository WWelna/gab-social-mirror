# frozen_string_literal: true

class ChatMessageLinkCrawlWorker
  include Sidekiq::Worker

  sidekiq_options queue: 'default', retry: 1

  def perform(chat_message_id)
    FetchChatMessageLinkCardService.new.call(ChatMessage.find(chat_message_id))
  rescue ActiveRecord::RecordNotFound, OpenSSL::SSL::SSLError, URI::InvalidURIError, GabSocial::NotPermittedError
    true
  end
end
