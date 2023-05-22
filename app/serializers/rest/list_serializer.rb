# frozen_string_literal: true

class REST::ListSerializer < ActiveModel::Serializer
  attributes :id, :title, :visibility, :created_at, :slug,
             :subscriber_count, :member_count, :url, :is_featured

  belongs_to :account, serializer: REST::AccountSerializer

  def id
    object.id.to_s
  end

  def member_count
    object.accounts.count
  end

  def url
    if !object.slug.nil?
      return "https://gab.com/feed/#{object.slug.to_s}"
    else
      return "https://gab.com/feeds/#{object.id.to_s}"
    end
  end

end
