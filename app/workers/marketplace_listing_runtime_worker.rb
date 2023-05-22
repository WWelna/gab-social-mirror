# frozen_string_literal: true

class MarketplaceListingRuntimeWorker
  include Sidekiq::Worker

  sidekiq_options lock: :until_executed

  def perform(marketplace_listing_id)
    # : TODO :
    return true

    # marketplace_listing = MarketplaceListing.find(marketplace_listing_id)

    # # ignore if expired
    # return if marketplace_listing.status.to_sym == :expired

    # # find all status changes where old and new is running
    # status_changes = marketplace_listing
    #   .marketplace_listing_status_changes
    #   .oldest
    #   .old_and_new_running

    # return if status_changes.count == 0

    # # https://apidock.com/rails/DateTime/to_i
    # # calculate time spent running
    # totalTimeRunningInSeconds = Time.now.to_i
    # status_changes.each do |block|
    #   # 
    #   if block.old_status.to_sym == :running
    #     totalTimeRunningInSeconds -= block.created_at.to_i
    #   end
    #   # 
    #   if block.new_status.to_sym == :running
    #     totalTimeRunningInSeconds += block.created_at.to_i
    #   end
    # end

    # # find and update or create MarketplaceListingRuntime with totalTimeRunningInSeconds
    # existing_runtime = MarketplaceListingRuntime.where(marketplace_listing_id: marketplace_listing.id).first

    # if existing_runtime.nil?
    #   MarketplaceListingRuntime.create(
    #     marketplace_listing_id: marketplace_listing.id,
    #     seconds: totalTimeRunningInSeconds,
    #   )
    # else
    #   existing_runtime.update!(seconds: totalTimeRunningInSeconds)    
    # end

    # # 
    # days_30_in_seconds = 2592000

    # # if totalTimeRunningInSeconds is gte total allowed runtime, then expire the listing
    # if totalTimeRunningInSeconds >= days_30_in_seconds
    #   MarketplaceListingStatusChangeService.new.call(
    #     marketplace_listing,
    #     :expired,
    #     'Listing has automatically expired after 30 days'
    #   )
    # end

  rescue ActiveRecord::RecordNotFound
    true
  end
end
