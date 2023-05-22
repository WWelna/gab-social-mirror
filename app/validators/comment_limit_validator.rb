# frozen_string_literal: true

class CommentLimitValidator < ActiveModel::Validator
  MAX_COMMENTS_DAILY_LIMIT = 1000
  MAX_COMMENTS_HOURLY_LIMIT = 250
  MAX_COMMENTS_HALF_HOUR_LIMIT = 100
  MAX_COMMENTS_MINUTE_LIMIT = 20

  def validate(comment)
    return if comment.account.nil?
    comment.errors.add(:base, 'Daily comment limit reached. Please slow down.') if daily_limit_reached?(comment.account)
    comment.errors.add(:base, 'Hourly comment limit reached. Please slow down.') if hourly_limit_reached?(comment.account)
    comment.errors.add(:base, 'Semi-hourly comment limit reached. Please slow down.') if half_hour_limit_reached?(comment.account)
    comment.errors.add(:base, 'Minute by minute comment limit reached. Please slow down.') if minute_by_minute_limit_reached?(comment.account)
  end

  private

  def daily_limit_reached?(account)
    Comment.where(account: account).where('created_at > ?', 1.day.ago).count >= MAX_COMMENTS_DAILY_LIMIT
  end

  def hourly_limit_reached?(account)
    Comment.where(account: account).where('created_at > ?', 1.hour.ago).count >= MAX_COMMENTS_HOURLY_LIMIT
  end

  def half_hour_limit_reached?(account)
    Comment.where(account: account).where('created_at > ?', 30.minutes.ago).count >= MAX_COMMENTS_HALF_HOUR_LIMIT
  end

  def minute_by_minute_limit_reached?(account)
    Comment.where(account: account).where('created_at > ?', 1.minute.ago).count >= MAX_COMMENTS_MINUTE_LIMIT
  end

end
