# frozen_string_literal: true

class Api::V1::MarketplaceListingsController < Api::BaseController
  include Authorization

  before_action :require_user!, except: [:show]
  before_action :ensure_user_pro!, except: [:show]
  before_action :set_marketplace_listing, except: [:create]
  before_action :ensure_ownership!, only: [:update, :destroy]

  def show
    render json: @marketplace_listing, serializer: REST::MarketplaceListingSerializer
  end

  def create
    @marketplace_listing = CreateMarketplaceListingService.new.call(
      current_account,
      marketplace_listing_params
    )
    render json: @marketplace_listing, serializer: REST::MarketplaceListingSerializer
  end

  def update
    authorize @marketplace_listing, :update?

    updated_marketplace_listing = CreateMarketplaceListingService.new.call(
      current_account,
      marketplace_listing_params,
      @marketplace_listing
    )

    # after editing, we need to change to pending review!
    MarketplaceListingStatusChangeService.new.call(
      @marketplace_listing,
      :pending_admin_review,
      nil,
      current_account
    )

    render json: updated_marketplace_listing, serializer: REST::MarketplaceListingSerializer
  end

  def destroy
    # : todo :
    # authorize @marketplace_listing, :destroy?
  end

  def set_status
    authorize @marketplace_listing, :update?

    MarketplaceListingStatusChangeService.new.call(
      @marketplace_listing,
      MarketplaceListing.statuses.key(params[:status].to_i),
      nil,
      current_account,
    )

    render json: @marketplace_listing, serializer: REST::MarketplaceListingSerializer
  end

  private

  def ensure_user_pro!
    if current_account && current_account.is_pro?
      true
    else
      render json: { error: 'Unauthorized' }, status: 501
    end
  end

  def ensure_ownership!
    if @marketplace_listing.account.id == current_account.id
      true
    else
      render json: { error: 'Unauthorized' }, status: 501
    end
  end

  def set_marketplace_listing
    @marketplace_listing = MarketplaceListing.find(params[:id])
    # important!
    authorize @marketplace_listing, :show?
  end

  def marketplace_listing_params
    thep = params.permit(
      :title,
      :description,
      :marketplace_listing_category_id,
      :condition,
      :location,
      :price,
      :is_shipping_required,
      tags: [],
      media_ids: []
    )
    thep[:condition] = thep[:condition].to_i if !thep[:condition].nil?
    thep
  end
end
