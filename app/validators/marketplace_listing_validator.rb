# frozen_string_literal: true

class MarketplaceListingValidator < ActiveModel::Validator
  MAX_CHARS_TITLE = 150
  MAX_CHARS_LOCATION = 150
  MAX_DESCRIPTION_TITLE = 5_000

  def validate(marketplaceListing)
    marketplaceListing.errors.add(:base, 'You must add a title.') if marketplaceListing.title.nil? || marketplaceListing.title.length === 0
    marketplaceListing.errors.add(:base, "Title cannot exceed #{MAX_CHARS_TITLE} characters.") if marketplaceListing.title.length > MAX_CHARS_TITLE
    marketplaceListing.errors.add(:base, 'You must add a description.') if marketplaceListing.description.nil? || marketplaceListing.description.length === 0
    marketplaceListing.errors.add(:base, "Description cannot exceed #{MAX_DESCRIPTION_TITLE}.") if marketplaceListing.description.length > MAX_DESCRIPTION_TITLE
    marketplaceListing.errors.add(:base, "Location cannot exceed #{MAX_CHARS_LOCATION}.") if !marketplaceListing.location.nil? && marketplaceListing.location.length > MAX_CHARS_LOCATION
    marketplaceListing.errors.add(:base, 'You must enter a valid price.') if marketplaceListing.price.nil? || marketplaceListing.price < 0
    marketplaceListing.errors.add(:base, 'You must select a category.') if marketplaceListing.marketplace_listing_category_id.nil?
  end
end
