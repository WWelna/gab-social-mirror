# frozen_string_literal: true

class FollowLimitValidator < ActiveModel::Validator
  LIMIT = ENV.fetch('MAX_FOLLOWS_THRESHOLD', 10_000).to_i
  RATIO = ENV.fetch('MAX_FOLLOWS_RATIO', 1.1).to_f
  
  MAX_FOLLOWS_DAILY_LIMIT = 200
  MAX_FOLLOWS_HOURLY_LIMIT = 20

  def validate(follow)
    return if follow.account.nil? || !follow.account.local?
    follow.errors.add(:base, I18n.t('users.follow_limit_reached', limit: self.class.limit_for_account(follow.account))) if limit_reached?(follow.account)
    follow.errors.add(:base, 'Daily follow limit reached. Please slow down.') if daily_limit_reached?(follow.account)
    follow.errors.add(:base, 'Hourly follow limit reached. Please slow down.') if hourly_limit_reached?(follow.account)
  end

  class << self
    def limit_for_account(account)
      return(0) if account.is_spam?
      return(25) unless account.user.confirmed?
      return(LIMIT) if account.following_count < LIMIT || !account.is_pro?

      [(account.followers_count * RATIO).round, LIMIT].max
    end
  end

  private

  def limit_reached?(account)
    account.following_count >= self.class.limit_for_account(account)
  end

  def daily_limit_reached?(account)
    Follow.where(account: account).where('created_at > ?', 1.day.ago).count >= MAX_FOLLOWS_DAILY_LIMIT
  end

  def hourly_limit_reached?(account)
    Follow.where(account: account).where('created_at > ?', 1.hour.ago).count >= MAX_FOLLOWS_HOURLY_LIMIT
  end

end
