# frozen_string_literal: true

class StatusLimitValidator < ActiveModel::Validator
  MAX_STATUSES_DAILY_LIMIT = 1500
  MAX_STATUSES_HOURLY_LIMIT = 250
  MAX_STATUSES_HALF_HOUR_LIMIT = 100
  MAX_STATUSES_MINUTE_LIMIT = 10

  def validate(status)
    return if status.account.nil?
    status.errors.add(:base, 'Daily status limit reached. Please slow down.') if daily_limit_reached?(status.account)
    status.errors.add(:base, 'Hourly status limit reached. Please slow down.') if hourly_limit_reached?(status.account)
    status.errors.add(:base, 'Semi-hourly status limit reached. Please slow down.') if half_hour_limit_reached?(status.account)
    status.errors.add(:base, 'Minute by minute status limit reached. Please slow down.') if minute_by_minute_limit_reached?(status.account)
  end

  private

  def daily_limit_reached?(account)
    Status.where(account: account).where('created_at > ?', 1.day.ago).count >= MAX_STATUSES_DAILY_LIMIT
  end

  def hourly_limit_reached?(account)
    Status.where(account: account).where('created_at > ?', 1.hour.ago).count >= MAX_STATUSES_HOURLY_LIMIT
  end

  def half_hour_limit_reached?(account)
    Status.where(account: account).where('created_at > ?', 30.minutes.ago).count >= MAX_STATUSES_HALF_HOUR_LIMIT
  end

  def minute_by_minute_limit_reached?(account)
    Status.where(account: account).where('created_at > ?', 1.minute.ago).count >= MAX_STATUSES_MINUTE_LIMIT
  end

end
