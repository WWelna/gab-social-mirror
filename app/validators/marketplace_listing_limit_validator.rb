
# frozen_string_literal: true

class MarketplaceListingLimitValidator < ActiveModel::Validator
  MAX_ACTIVE_LISTINGS = 3
  PRO_MAX_ACTIVE_LISTINGS = 15

  def validate(marketplaceListing)
    # only on create!
    return if !marketplaceListing.created_at.nil?

    if marketplaceListing.account.is_pro?
      marketplaceListing.errors.add(:base, "You can create a maximum of #{PRO_MAX_ACTIVE_LISTINGS} listings per day") if limit_reached?(marketplaceListing, true)
    else
      marketplaceListing.errors.add(:base, "You can create a maximum of #{MAX_ACTIVE_LISTINGS} listings per day") if limit_reached?(marketplaceListing, false)
    end
  end

  private

  def limit_reached?(marketplaceListing, isPro)
    count = isPro ? PRO_MAX_ACTIVE_LISTINGS : MAX_ACTIVE_LISTINGS
    MarketplaceListing.active
      .where(account: marketplaceListing.account)
      .where('created_at > ?', 1.day.ago)
      .count >= count
  end

end
