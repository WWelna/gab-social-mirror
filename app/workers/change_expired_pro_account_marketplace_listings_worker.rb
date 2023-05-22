# frozen_string_literal: true

class ChangeExpiredProAccountMarketplaceListingsWorker
  include Sidekiq::Worker

  sidekiq_options retry: 3

  def perform(acct_id)
    @acct = Account.find(acct_id)
    
    # make sure that acct isn't pro
    return if @acct.is_pro?

    # we don't actually expire them. we just turn them from running back to "approved".
    # if we expired them, they can't reopen
    # doing it this way... setting to "approved"... will allow user to re-join pro and simply
    #   change the existing "approved" listings back to running
    @acct.marketplace_listings.only_running.each do |listing|
      MarketplaceListingStatusChangeService.new.call(
        listing,
        :approved,
        'Your GabPRO membership expired. This listing has been reverted back to an Approved state. You may turn it back on again when you update your GabPRO membership.'
      )
    end
  end

end
