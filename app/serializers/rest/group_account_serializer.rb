# frozen_string_literal: true

class REST::GroupAccountSerializer < ActiveModel::Serializer
  attributes :id, :group_id, :is_approved, :role, :write_permissions,
             :group_account_badge_id

  belongs_to :account, serializer: REST::AccountSerializer

  def id
    object.id.to_s
  end

  def group_id
    object.group_id.to_s
  end

  def group_account_badge_id
    object.group_account_badge_id.to_s
  end

end
