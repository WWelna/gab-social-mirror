# frozen_string_literal: true

class UnfavouriteLimitValidator < ActiveModel::Validator
  DAILY_UNLIKE_LIMIT = 100
  HOURLY_UNLIKE_LIMIT = 20

  def validate(unfavourite)
    return if unfavourite.account.nil?
    unfavourite.errors.add(:base, 'Daily un-like limit reached. Please slow down.') if daily_limit_reached?(unfavourite.account)
    unfavourite.errors.add(:base, 'Hourly un-like limit reached. Please slow down.') if hourly_limit_reached?(unfavourite.account)
  end

  private

  def daily_limit_reached?(account)
    Unfavourite.where(account: account).where('created_at > ?', 1.day.ago).count >= DAILY_UNLIKE_LIMIT
  end

  def hourly_limit_reached?(account)
    Unfavourite.where(account: account).where('created_at > ?', 1.hour.ago).count >= HOURLY_UNLIKE_LIMIT
  end
end
  