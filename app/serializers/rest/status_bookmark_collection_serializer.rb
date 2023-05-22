# frozen_string_literal: true

class REST::StatusBookmarkCollectionSerializer < ActiveModel::Serializer
  attributes :id, :title, :account_id

  def id
    object.id.to_s
  end

end
