# frozen_string_literal: true

class MarketplaceListingLimitValidator < ActiveModel::Validator
  MAX_LISTINGS = 3
  PRO_MAX_LISTINGS = 15

  def validate(marketplaceListing)
    # only on create!
    return if !marketplaceListing.created_at.nil?

    if marketplaceListing.account.is_pro?
      marketplaceListing.errors.add(:base, "You can create a maximum of #{PRO_MAX_LISTINGS} listings per week") if limit_reached?(marketplaceListing, true)
    else
      marketplaceListing.errors.add(:base, "You can create a maximum of #{MAX_LISTINGS} listings per week") if limit_reached?(marketplaceListing, false)
    end
  end

  private

  def limit_reached?(marketplaceListing, isPro)
    count = isPro ? PRO_MAX_LISTINGS : MAX_LISTINGS
    MarketplaceListing.where(account: marketplaceListing.account)
      .where('created_at > ?', 7.days.ago)
      .count >= count
  end

end
