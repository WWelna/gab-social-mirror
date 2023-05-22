# frozen_string_literal: true

class LinkCrawlWorker
  include Sidekiq::Worker

  sidekiq_options queue: 'default', retry: 3

  def perform(status_id)
    FetchLinkCardService.new.call(Status.find(status_id))
  rescue ActiveRecord::RecordNotFound, OpenSSL::SSL::SSLError, URI::InvalidURIError, GabSocial::NotPermittedError
    true
  end
end
