# frozen_string_literal: true

class FollowRequestLimitValidator < ActiveModel::Validator
  MAX_FOLLOW_REQUESTS_LIMIT = 1000
  MAX_FOLLOW_REQUESTS_DAILY_LIMIT = 100
  MAX_FOLLOW_REQUESTS_HOURLY_LIMIT = 20

  def validate(follow_request)
    return if follow_request.account.nil? || !follow_request.account.local?
    follow_request.errors.add(:base, 'Total follow request limit has been reached. Please slow down.') if limit_reached?(follow_request.account)
    follow_request.errors.add(:base, 'Daily follow request limit reached. Please slow down.') if daily_limit_reached?(follow_request.account)
    follow_request.errors.add(:base, 'Hourly follow request limit reached. Please slow down.') if hourly_limit_reached?(follow_request.account)
  end

  class << self
    def limit_for_account(account)
      return(0) if account.is_spam?
      return(25) unless account.user.confirmed?
      return(MAX_FOLLOW_REQUESTS_LIMIT)
    end
  end

  private

  def limit_reached?(account)
    account.follow_requests.count >= self.class.limit_for_account(account)
  end

  def daily_limit_reached?(account)
    FollowRequest.where(account: account).where('created_at > ?', 1.day.ago).count >= MAX_FOLLOW_REQUESTS_DAILY_LIMIT
  end

  def hourly_limit_reached?(account)
    FollowRequest.where(account: account).where('created_at > ?', 1.hour.ago).count >= MAX_FOLLOW_REQUESTS_HOURLY_LIMIT
  end

end
