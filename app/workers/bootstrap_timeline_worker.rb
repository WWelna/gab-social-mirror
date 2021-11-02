# frozen_string_literal: true

class BootstrapTimelineWorker
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(account_id)
    ActiveRecord::Base.connected_to(role: :writing) do
      BootstrapTimelineService.new.call(Account.find(account_id))
    end
  rescue ActiveRecord::RecordNotFound
  end
end
