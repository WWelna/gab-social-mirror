# frozen_string_literal: true

class PurgeNotificationsWorker
  include Sidekiq::Worker

  sidekiq_options queue: 'default', retry: 3

  def perform(account_id = nil, max_id = nil)
    return true if account_id.nil?

    # Destroy all mine
    Notification.
      where(account_id: account_id).
      then { |r| max_id ? r.where('id <= ?', max_id) : r }.
      in_batches.
      delete_all
  end
end
