# frozen_string_literal: true

class REST::GroupModerationEventSerializer < ActiveModel::Serializer
  attributes :group_id, :group_name, :account_id, :status_id, :approved, :rejected, :removed, :acted_at

  belongs_to :group, serializer: REST::GroupSerializer

  def group_id
    defined?(object.group_id) && object.group_id.to_s
  end

  def group_name
    defined?(object.group) && object.group.title
  end

  def account_id
    object.account_id.to_s
  end

  def status_id
    object.status_id.to_s
  end

  def approved
    object.approved?
  end

  def rejected
    object.rejected?
  end

  def removed
    object.removed?
  end

  def acted_at
    object.acted_at
  end

end