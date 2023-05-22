# frozen_string_literal: true

class Api::V1::MarketplaceListings::SavesController < Api::BaseController
  include Authorization

  before_action :require_user!
  before_action :set_marketplace_listing

  # check if is saved, regardless of status
  def show
    listing_save = MarketplaceListingSave.find_by(account: current_account, marketplace_listing: @marketplace_listing)
    render json: { marketplace_listing_id: @marketplace_listing, saved: !listing_save.nil? }
  end

  # create new
  def create
    # only allow save on _running_ listings
    authorize @marketplace_listing, :show?

    listing_save = MarketplaceListingSave.find_by(account: current_account, marketplace_listing: @marketplace_listing)
    if listing_save.nil?
      MarketplaceListingSave.create!(account: current_account, marketplace_listing: @marketplace_listing)
      render json: { marketplace_listing_id: @marketplace_listing, saved: true }
    else
      return render json: { error: 'You already saved this Marketplace listing' }, status: 500
    end
  end

  # delete saved listing
  def destroy
    # allow unsaves on all listings, regardless of status
    listing_save = MarketplaceListingSave.find_by(account: current_account, marketplace_listing: @marketplace_listing)

    if !listing_save.nil?
      listing_save.destroy!
      render json: { marketplace_listing_id: @marketplace_listing, saved: false }
    else 
      return render json: { error: 'You did not save this Marketplace listing' }, status: 500
    end
  end

  private

  def set_marketplace_listing
    @marketplace_listing = MarketplaceListing.find(params[:marketplace_listing_id])
  end

end
