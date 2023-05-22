# frozen_string_literal: true

class FetchStatusLinkCardService < BaseService
  def call(status)
    @status = status
    return false if status.nil?

    @card = FetchLinkCardService.new.call(@status.text)

    if @status.preview_cards.any?
      if @card.nil?
        detach_card
        return
      end
      return if @status.preview_cards.first.url == @card.url
    end

    attach_card if @card&.persisted?

    return true
  rescue HTTP::Error, Addressable::URI::InvalidURIError, GabSocial::HostValidationError, GabSocial::LengthValidationError => e
    Rails.logger.debug "Error fetching link #{@url}: #{e}"
    nil
  end

  private

  def attach_card
    @status.preview_cards = [@card]
    send_status_update_payload(@status)
    Rails.cache.delete(@status)
  end

  def detach_card
    @status.preview_cards = []
    send_status_update_payload(@status)
    Rails.cache.delete(@status)
  end

  def send_status_update_payload(status)
    @payload = InlineRenderer.render(status, nil, :status)
    @payload = Oj.dump(event: :edit_status, payload: @payload)
    Redis.current.publish("altstream:main", @payload)
  end
end
