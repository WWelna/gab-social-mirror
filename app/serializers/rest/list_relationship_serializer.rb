# frozen_string_literal: true

class REST::ListRelationshipSerializer < ActiveModel::Serializer
  attributes :id, :member, :subscriber

  def id
    object.id.to_s
  end

  def member
    instance_options[:relationships].member[object.id] ? true : false
  end

  def subscriber
    instance_options[:relationships].subscriber[object.id] ? true : false
  end

end
