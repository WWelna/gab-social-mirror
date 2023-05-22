# frozen_string_literal: true

class Api::V1::MarketplaceListingBrowseController < Api::BaseController
  after_action :insert_pagination_headers, unless: -> { @listings.empty? }

  def index
    @listings = cached_listings
    render json: @listings, each_serializer: REST::MarketplaceListingSerializer
  end

  private

  def cached_listings
    cache_collection load_listings, MarketplaceListing
  end

  def load_listings
    listings = MarketplaceListing.recent.active.paginate_by_id(
      limit_param(DEFAULT_MARKETPLACE_LISTINGS_LIMIT),
      params_slice(:max_id, :since_id, :min_id)
    )

    listings
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def pagination_params(core_params)
    params.slice(:limit).permit(:limit).merge(core_params)
  end

  def next_path
    api_v1_marketplace_listing_browse_index_url pagination_params(max_id: pagination_max_id)
  end

  def prev_path
    api_v1_marketplace_listing_browse_index_url pagination_params(min_id: pagination_since_id)
  end

  def pagination_max_id
    @listings.last.id
  end

  def pagination_since_id
    @listings.first.id
  end
end
