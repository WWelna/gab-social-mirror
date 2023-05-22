# frozen_string_literal: true

class ShortcutStatusCountIncrementWorker
  include Sidekiq::Worker

  sidekiq_options queue: 'pull', retry: 1
  
  def perform(status_id)
    ShortcutStatusCountIncrementService.new.call(Status.find(status_id))
  rescue ActiveRecord::RecordNotFound, OpenSSL::SSL::SSLError, URI::InvalidURIError, GabSocial::NotPermittedError
    true
  end

end
