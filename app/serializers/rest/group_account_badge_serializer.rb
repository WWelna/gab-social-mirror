# frozen_string_literal: true

class REST::GroupAccountBadgeSerializer < ActiveModel::Serializer
  attributes :id, :group_id, :name, :color, :icon, :description

  def id
    object.id.to_s
  end

  def group_id
    object.group_id.to_s
  end
  
end
