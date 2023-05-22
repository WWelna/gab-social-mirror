# frozen_string_literal: true

class FetchChatMessageLinkCardService < BaseService
  def call(chatMessage)
    @chatMessage = chatMessage
    return false if chatMessage.nil?

    @card = FetchLinkCardService.new.call(@chatMessage.text)

    if @chatMessage.preview_cards.any?
      if @card.nil?
        detach_card
        return
      end
      return if @chatMessage.preview_cards.first.url == @card.url
    end

    attach_card if @card&.persisted?

    return true
  rescue HTTP::Error, Addressable::URI::InvalidURIError, GabSocial::HostValidationError, GabSocial::LengthValidationError => e
    Rails.logger.debug "Error fetching link #{@url}: #{e}"
    nil
  end

  private

  def attach_card
    @chatMessage.preview_cards = [@card]
    send_chatMessage_update_payload(@chatMessage)
    Rails.cache.delete(@chatMessage)
  end

  def detach_card
    @chatMessage.preview_cards = []
    send_chatMessage_update_payload(@chatMessage)
    Rails.cache.delete(@chatMessage)
  end

  def send_chatMessage_update_payload(chatMessage)
    # TODO: implement consumption of this event.. disabling sending it for now.
    #@payload = InlineRenderer.render(chatMessage, nil, :chatMessage)
    #@payload = Oj.dump(event: :update, payload: @payload)
    #Redis.current.publish("chatmessagecard:#{chatMessage.chat_conversation_id}", @payload)
  end
end
