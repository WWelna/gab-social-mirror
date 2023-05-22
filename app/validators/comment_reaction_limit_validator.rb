# frozen_string_literal: true

class CommentReactionLimitValidator < ActiveModel::Validator
  HALF_HOURLY_LIKE_LIMIT = 120

  def validate(reaction)
    return if reaction.account.nil?
    reaction.errors.add(:base, 'Semi-hourly reaction rate-limit reached. Please slow down.') if semi_hourly_limit_reached?(reaction.account)
  end

  private

  def semi_hourly_limit_reached?(account)
    CommentReaction.where(account: account).where('created_at > ?', 30.minutes.ago).count >= HALF_HOURLY_LIKE_LIMIT
  end
end
  