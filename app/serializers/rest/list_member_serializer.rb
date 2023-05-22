# frozen_string_literal: true

class REST::ListMemberSerializer < ActiveModel::Serializer
  attributes :id, :member_count, :member

  def id
    object.id.to_s
  end

  def member_count
    object.accounts.count
  end

  def member
    instance_options && instance_options[:member]
  end

end
