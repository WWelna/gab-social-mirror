# frozen_string_literal: true

class LinkCrawlWorker
  include Sidekiq::Worker

  sidekiq_options queue: 'default', retry: 1

  def perform(status_id)
    FetchStatusLinkCardService.new.call(Status.find(status_id))
  rescue ActiveRecord::RecordNotFound, OpenSSL::SSL::SSLError, URI::InvalidURIError, GabSocial::NotPermittedError
    true
  end
end
