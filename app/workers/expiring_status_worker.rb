# frozen_string_literal: true

class ExpiringStatusWorker
  include Sidekiq::Worker

  sidekiq_options lock: :until_executed

  def perform(status_id)
    status = Status.find(status_id)
    return true if status.expires_at.nil? || status.expires_at > Time.now + 2.minutes
    RemovalWorker.perform_async(status.id)
  rescue ActiveRecord::RecordNotFound
    true
  end
end
