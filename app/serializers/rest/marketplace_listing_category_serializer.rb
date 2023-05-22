# frozen_string_literal: true

class REST::MarketplaceListingCategorySerializer < ActiveModel::Serializer
  include RoutingHelper

  attributes :id, :name, :slug, :description, :cover_image_url

  def cover_image_url
    full_asset_url(object.cover_image.url)
  end

end
