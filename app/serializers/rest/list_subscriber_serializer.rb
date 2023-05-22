# frozen_string_literal: true

class REST::ListSubscriberSerializer < ActiveModel::Serializer
  attributes :id, :subscriber_count, :subscriber

  def id
    object.id.to_s
  end

  def subscriber
    instance_options && instance_options[:subscriber]
  end

end
