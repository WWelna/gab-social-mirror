# frozen_string_literal: true

class Api::V1::MarketplaceListingSearchController < Api::BaseController

  after_action :insert_pagination_headers

  def index
    @marketplace_listings = marketplace_listing_search
    render json: @marketplace_listings, each_serializer: REST::MarketplaceListingSerializer
  end

  private

  def insert_pagination_headers
    links = []
    links << [next_path, [%w(rel next)]]
    response.headers['Link'] = LinkHeader.new(links) unless links.empty?
  end

  def next_path
    if records_continue?
      api_v1_marketplace_listing_search_index_url pagination_params(page: next_page)
    end
  end

  def records_continue?
    @marketplace_listings.size == limit_param(DEFAULT_MARKETPLACE_LISTINGS_LIMIT)
  end

  def next_page
    page = params[:page]
    if !page.nil?
      page = page.to_i + 1
    else
      page = 2
    end
    page
  end

  def pagination_params(core_params)
    params.slice(
      :query, :category_id, :account_id, :location, :price_min, :price_max, :condition, :sort_by, :page, :tags, :has_images, :shipping_required
    ).permit(
      :query, :category_id, :account_id, :location, :price_min, :price_max, :condition, :sort_by, :page, :tags, :has_images, :shipping_required
    ).merge(core_params)
  end

  def marketplace_listing_search
    MarketplaceListingSearchService.new.call(
      current_account,
      DEFAULT_MARKETPLACE_LISTINGS_LIMIT,
      query: params[:query],
      category_id: params[:category_id],
      location: params[:location],
      price_min: params[:price_min],
      price_max: params[:price_max],
      condition: params[:condition],
      sort_by: params[:sort_by],
      shipping_required: params[:shipping_required],
      has_images: params[:has_images],
      tags: params[:tags],
      id: params[:id],
      account_id: params[:account_id],
      page: params[:page]
    )
  end

  def search_params
    params.permit(:query, :category_id, :account_id, :location, :price_min, :price_max, :condition, :sort_by, :page, :tags, :has_images, :shipping_required)
  end

end
