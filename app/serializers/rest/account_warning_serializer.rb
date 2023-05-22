# frozen_string_literal: true

class REST::AccountWarningSerializer < ActiveModel::Serializer
  attributes :id, :action, :text, :user_dismissed_at, :created_at, :statuses

  def id
    object.id.to_s
  end

  def statuses
  end

end
