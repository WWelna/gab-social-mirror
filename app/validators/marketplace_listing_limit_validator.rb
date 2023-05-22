
# frozen_string_literal: true

class MarketplaceListingLimitValidator < ActiveModel::Validator
  MAX_ACTIVE_LISTINGS = 15

  def validate(marketplaceListing)
    # only on create!
    return if !marketplaceListing.created_at.nil?
    marketplaceListing.errors.add(:base, "You can create a maximum of #{MAX_ACTIVE_LISTINGS} listings per day") if limit_reached?(marketplaceListing)
  end

  private

  def limit_reached?(marketplaceListing)
    MarketplaceListing.active
      .where(account: marketplaceListing.account)
      .where('created_at > ?', 1.day.ago)
      .count >= MAX_ACTIVE_LISTINGS
  end

end
