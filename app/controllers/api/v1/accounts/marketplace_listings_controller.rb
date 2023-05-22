# frozen_string_literal: true

# do not cache. only to be called by user who owns listings. checks are made
# includes pending, expired, sold ... all listings
class Api::V1::Accounts::MarketplaceListingsController < Api::BaseController
  before_action :require_user!
  before_action :validate_params!
  before_action :set_account
  after_action :insert_pagination_headers

  def index
    @marketplace_listings = load_marketplace_listings
    render json: @marketplace_listings, each_serializer: REST::MarketplaceListingSerializer
  end

  private

  def validate_params!
    if params[:account_id].to_i == current_account.id
      status = params[:status]
      if status == "all" || status == "[]" || status.nil? || status.empty? || status.blank?
        @listing_status = nil
      else
        @listing_status = status
      end
    else
      # ONLY allow to fetch running listings if queried for id that isnt current_account
      @listing_status = :running

      # If searching, and not owned, error
      if !params[:query].nil?
        render json: { error: 'Unauthorized' }, status: 501
      end
    end

    true
  end

  def load_marketplace_listings
    query = @account.marketplace_listings.recent
  
    if !@listing_status.nil?
      query = query.where(status: @listing_status)
    end

    if params[:account_id].to_i == current_account.id && (!params[:query].nil? && !params[:query].empty? && !params[:query].blank?)
      query = query.matching(:title, :contains, params[:query])
    end

    query.paginate_by_id(limit_param(DEFAULT_MARKETPLACE_LISTINGS_LIMIT), params_slice(:max_id, :since_id, :min_id))
  end

  def set_account
    @account = Account.find(params[:account_id])
  end

  def pagination_params(core_params)
    params.slice(:limit).permit(:limit).merge(core_params)
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    if records_continue?
      api_v1_account_marketplace_listings_url pagination_params(max_id: pagination_max_id)
    end
  end

  def prev_path
    unless @marketplace_listings.empty?
      api_v1_account_marketplace_listings_url pagination_params(min_id: pagination_since_id)
    end
  end

  def records_continue?
    @marketplace_listings.size == limit_param(DEFAULT_MARKETPLACE_LISTINGS_LIMIT)
  end

  def pagination_max_id
    @marketplace_listings.last.id
  end

  def pagination_since_id
    @marketplace_listings.first.id
  end
end
