# frozen_string_literal: true

class FavouriteLimitValidator < ActiveModel::Validator
  HALF_HOURLY_LIKE_LIMIT = 120

  def validate(favourite)
    return if favourite.account.nil?
    favourite.errors.add(:base, 'Semi-hourly like rate-limit reached. Please slow down.') if semi_hourly_limit_reached?(favourite.account)
  end

  private

  def semi_hourly_limit_reached?(account)
    Favourite.where(account: account).where('created_at > ?', 30.minutes.ago).count >= HALF_HOURLY_LIKE_LIMIT
  end
end
  