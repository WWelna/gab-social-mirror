# frozen_string_literal: true

class UnfollowLimitValidator < ActiveModel::Validator
  DAILY_UNFOLLOW_LIMIT = 50
  HOURLY_UNFOLLOW_LIMIT = 10

  def validate(unfollow)
    return if unfollow.account.nil?
    unfollow.errors.add(:base, 'Daily unfollow limit reached. Please slow down.') if daily_limit_reached?(unfollow.account)
    unfollow.errors.add(:base, 'Hourly unfollow limit reached. Please slow down.') if hourly_limit_reached?(unfollow.account)
  end

  private

  def daily_limit_reached?(account)
    Unfollow.where(account: account).where('created_at > ?', 1.day.ago).count >= DAILY_UNFOLLOW_LIMIT
  end

  def hourly_limit_reached?(account)
    Unfollow.where(account: account).where('created_at > ?', 1.hour.ago).count >= HOURLY_UNFOLLOW_LIMIT
  end

end
  