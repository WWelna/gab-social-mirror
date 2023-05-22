# frozen_string_literal: true

# add up total time of running status
# check when after tallying the total time if it is more than 30 days
class Scheduler::MarketplaceListingRuntimeScheduler
  include Sidekiq::Worker
  
  sidekiq_options retry: 3

  def perform
    MarketplaceListing.active.reorder(nil).find_in_batches do |marketplace_listings|
      marketplace_listings.each do |m|
        MarketplaceListingRuntimeWorker.perform_async(m.id)
      end
    end
  end

end