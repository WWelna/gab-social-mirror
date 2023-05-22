# frozen_string_literal: true

class StatusBookmarkLimitValidator < ActiveModel::Validator
  MAX_STATUS_BOOKMARKS_DAILY_LIMIT = 250
  
  def validate(status_bookmark)
    return if status_bookmark.account.nil?
    status_bookmark.errors.add(:base, 'Daily bookmark limit of 250 is reached. Please slow down.') if daily_limit_reached?(status_bookmark.account)
  end

  private

  def daily_limit_reached?(account)
    StatusBookmark.where(account: account).where('created_at > ?', 1.day.ago).count >= MAX_STATUS_BOOKMARKS_DAILY_LIMIT
  end

end
