# frozen_string_literal: true

class REST::MarketplaceListingSerializer < ActiveModel::Serializer
  attributes :id, :title, :description, :tags, :location, :created_at,
             :status_i, :status_s, :condition, :price, :is_expired, :runtime_seconds,
             :saves, :price_label, :url, :is_shipping_required, :description_html

  belongs_to :account, serializer: REST::AccountSerializer
  belongs_to :marketplace_listing_category, serializer: REST::MarketplaceListingCategorySerializer
  has_many :media_attachments, serializer: REST::MediaAttachmentSerializer

  def description_html
    Formatter.instance.formatGroupDescription(object.description).strip
  end

  def is_expired
    object.is_expired?
  end

  def runtime_seconds
    object.runtime_seconds
  end

  def id
    object.id.to_s
  end

  def saves
    object.marketplace_listing_saves.count
  end

  def price_label
    whole_number = (object.price % 1).zero?
    precision = whole_number ? 0 : 2
    ActionController::Base.helpers.number_to_currency(object.price, precision: precision)
  end

  def url
    "https://#{ENV['LOCAL_DOMAIN']}/marketplace/item/#{object.id.to_s}"
  end

  def condition
    MarketplaceListing.conditions[object.condition]
  end

  def status_i
    MarketplaceListing.statuses[object.status]
  end

  def status_s
    object.status_s
  end

end
