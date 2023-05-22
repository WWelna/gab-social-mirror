# frozen_string_literal: true

class Api::V1::MarketplaceListings::StatusChangesController < Api::BaseController
  before_action :require_user!
  before_action :set_marketplace_listing

  after_action :insert_pagination_headers

  def show
    @changes = get_status_changes
    render json: @changes, each_serializer: REST::MarketplaceListingStatusChangeSerializer
  end

  private

  def get_status_changes
    @marketplace_listing.marketplace_listing_status_changes.paginate_by_id(limit_param(DEFAULT_MARKETPLACE_LISTINGS_LIMIT), params_slice(:max_id, :since_id, :min_id))
  end

  def set_marketplace_listing
    # only query for CURRENT_ACCOUNT listing, ensure ownership!
    @marketplace_listing = current_account.marketplace_listings.find(params[:marketplace_listing_id])
  end

  def pagination_params(core_params)
    params.slice(:limit).permit(:limit).merge(core_params)
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    if records_continue?
      api_v1_marketplace_listing_status_changes_url pagination_params(max_id: pagination_max_id)
    end
  end

  def prev_path
    unless @changes.empty?
      api_v1_marketplace_listing_status_changes_url pagination_params(min_id: pagination_since_id)
    end
  end

  def records_continue?
    @changes.size == limit_param(DEFAULT_MARKETPLACE_LISTINGS_LIMIT)
  end

  def pagination_max_id
    @changes.last.id
  end

  def pagination_since_id
    @changes.first.id
  end
end
