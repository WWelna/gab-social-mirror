# frozen_string_literal: true

class REST::TagSerializer < ActiveModel::Serializer
  include RoutingHelper

  attributes :id, :name, :url

  def url
    "/tags/#{object.name}"
  end
end
