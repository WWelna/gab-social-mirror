# frozen_string_literal: true

class REST::GroupQuestionSerializer < ActiveModel::Serializer
  attributes :id, :group_id, :title, :description, :index, :created_at

  def id
    object.id.to_s
  end

  def group_id
    object.group_id.to_s
  end

end
