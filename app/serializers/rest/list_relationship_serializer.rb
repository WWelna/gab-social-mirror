# frozen_string_literal: true

class REST::ListRelationshipSerializer < ActiveModel::Serializer
  attributes :id, :member, :subscriber, :admin

  def id
    object.id.to_s
  end

  def admin
    if !current_user.nil?
      current_user.account.id.to_s == object.account_id.to_s
    else 
      false
    end
  end

  def member
    instance_options[:relationships].member[object.id] ? true : false
  end

  def subscriber
    instance_options[:relationships].subscriber[object.id] ? true : false
  end

end
