# frozen_string_literal: true

class REST::TimelinePresetSerializer < ActiveModel::Serializer
  attributes :id, :account_id, :created_at, :timeline, :timeline_id,
             :name, :filters, :sort

  def id
    object.id.to_s
  end

end
