# frozen_string_literal: true

class StatusContextValidator < ActiveModel::Validator
  PER_GROUP_STATUS_CONTEXT_TOTAL_LIMIT = 100

  def validate(status_context)
    return if !status_context.is_group?
    status_context.errors.add(:base, "Group status_context limit reached. Max: #{PER_GROUP_STATUS_CONTEXT_TOTAL_LIMIT}") if group_limit_reached?(status_context)

    # done in model
    # status_context.errors.add(:options, "Context name is too long. Max: 50") if status_context.name && status_context.name.mb_chars.grapheme_length > 50
  end

  private

  def group_limit_reached?(status_context)
    return false if !status_context.is_group?
    StatusContext.owned_by_group.where(owner_id: status_context.owner_id).count >= PER_GROUP_STATUS_CONTEXT_TOTAL_LIMIT
  end
end
  