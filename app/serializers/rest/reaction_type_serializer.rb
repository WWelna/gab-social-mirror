# frozen_string_literal: true

class REST::ReactionTypeSerializer < ActiveModel::Serializer
  include RoutingHelper
  
  attributes :id, :name, :name_past, :name_plural,
             :slug, :index, :is_active, :icon

  def id
    object.id.to_s
  end

  def is_active
    object.is_active?
  end

  def icon
    full_asset_url(object.image.url)
  end

end
