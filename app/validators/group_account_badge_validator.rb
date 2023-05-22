# frozen_string_literal: true

class GroupAccountBadgeValidator < ActiveModel::Validator
  PER_GROUP_ACCOUNT_BADGE_TOTAL_LIMIT = 25

  def validate(badge)
    return if badge.group.nil?
    badge.errors.add(:base, "Group account badge limit reached. Max: #{PER_GROUP_ACCOUNT_BADGE_TOTAL_LIMIT}") if limit_reached?(badge.group)
    badge.errors.add(:options, "Badge description is too long. Max: 120") if badge.description && badge.description.mb_chars.grapheme_length > 120
    badge.errors.add(:options, "Badge color is invalid.") if badge.color && badge.color.mb_chars.grapheme_length > 10
    badge.errors.add(:options, "Badge icon is invalid.") if badge.icon && badge.icon.mb_chars.grapheme_length > 50

    # done in model
    # badge.errors.add(:options, "Badge name is too long. Max: 30") if badge.name && badge.name.mb_chars.grapheme_length > 30
  end

  private

  def limit_reached?(group)
    group.group_account_badges.count >= PER_GROUP_ACCOUNT_BADGE_TOTAL_LIMIT
  end
end
  