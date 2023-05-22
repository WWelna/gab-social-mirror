# frozen_string_literal: true

class REST::FavouriteSerializer < ActiveModel::Serializer
  attributes :id, :account_id, :status_id, :reaction_id

  def id
    object.id.to_s
  end

  def account_id
    object.account_id.to_s
  end

  def status_id
    object.status_id.to_s
  end

  def reaction_id
    object.reaction_id.nil? ? '1' : object.reaction_id.to_s
  end

end