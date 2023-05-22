# frozen_string_literal: true

class Api::V1::MarketplaceListingSavesController < Api::BaseController
  before_action :require_user!
  before_action :set_saves, only: [:index]
  after_action :insert_pagination_headers, only: [:index]

  # find my saves
  def index
    render json: @saves, each_serializer: REST::MarketplaceListingSerializer
  end

  private

  def set_saves
    # : todo :
    # order by saves?
    # : todo :
    # if mine, show all, regardless of running or not
    @saves = MarketplaceListing.only_running
      .joins(:marketplace_listing_saves)
      .where(marketplace_listing_saves: {
        account: current_account
      })
      .paginate_by_id(limit_param(DEFAULT_MARKETPLACE_LISTINGS_LIMIT), params_slice(:max_id, :since_id, :min_id))
  end

  def pagination_params(core_params)
    params.slice(:limit).permit(:limit).merge(core_params)
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    if records_continue?
      api_v1_marketplace_listing_saves_url pagination_params(max_id: pagination_max_id)
    end
  end

  def prev_path
    unless @saves.empty?
      api_v1_marketplace_listing_saves_url pagination_params(min_id: pagination_since_id)
    end
  end

  def records_continue?
    @saves.size == limit_param(DEFAULT_MARKETPLACE_LISTINGS_LIMIT)
  end

  def pagination_max_id
    @saves.last.id
  end

  def pagination_since_id
    @saves.first.id
  end
end
