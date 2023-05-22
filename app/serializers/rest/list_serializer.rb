# frozen_string_literal: true

class REST::ListSerializer < ActiveModel::Serializer
  attributes :id, :title, :visibility, :created_at, :slug,
             :subscriber_count, :member_count, :url

  belongs_to :account, serializer: REST::AccountSerializer

  def id
    object.id.to_s
  end

  def member_count
    ListAccount.where(list: object.id).count
  end

  def url
    if !object.slug.nil?
      return "https://gab.com/list/#{object.slug.to_s}"
    else
      return "https://gab.com/lists/#{object.id.to_s}"
    end
  end

end
