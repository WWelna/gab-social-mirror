# frozen_string_literal: true

class REST::StatusContextSerializer < ActiveModel::Serializer
  attributes :id, :name, :index, :is_global, :is_enabled
  
  attribute :group_id, if: :is_group_owned?

  def id
    object.id.to_s
  end

  def group_id
    if is_group_owned?
      return object.owner_id.to_s 
    else
      nil
    end
  end

  def is_group_owned?
    object.owner_type.to_s == "group"
  end

end
