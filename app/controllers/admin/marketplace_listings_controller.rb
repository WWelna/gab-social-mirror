# frozen_string_literal: true
module Admin
  class MarketplaceListingsController < BaseController
    before_action :set_marketplace_listing, except: [:index]

    PER_PAGE = 25

    def index
      authorize :marketplace_listing, :index?
      @marketplace_listings = filtered_marketplace_listings.page(params[:page]).per(PER_PAGE)
    end

    def show
      # : todo :
      # authorize @marketplace_listing, :show?
      @marketplace_listing_status_changes = @marketplace_listing.marketplace_listing_status_changes
    end

    def destroy
      authorize @marketplace_listing, :destroy?
      @marketplace_listing.destroy!
      log_action :destroy, @marketplace_listing
      flash[:notice] = 'Marketplace listing destroyed'
      redirect_to admin_marketplace_listings_path
    end

    def approve
      MarketplaceListingStatusChangeService.new.call(
        @marketplace_listing,
        :approved,
        nil,
        current_account,
      )
      MarketplaceListingStatusChangeService.new.call(
        @marketplace_listing,
        :running,
        nil,
        current_account,
      )
      redirect_to admin_marketplace_listing_path(@marketplace_listing.id), notice: 'Marketplace Listing Approved and Running'
    end

    def request_revisions
      MarketplaceListingStatusChangeService.new.call(
        @marketplace_listing,
        :pending_user_changes,
        params[:note],
        current_account,
      )

      redirect_to admin_marketplace_listing_path(@marketplace_listing.id), notice: 'Marketplace Listing Revision Request Sent'
    end

    def set_status
      message = nil
      if !params[:note].nil?
        message = params[:note]
      end
      if !params[:status_reason].nil?
        if !message.nil?
          # append
          message += " - #{params[:status_reason]}"
        else
          message = params[:status_reason]
        end
      end

      MarketplaceListingStatusChangeService.new.call(
        @marketplace_listing,
        MarketplaceListing.statuses.key(params[:new_status].to_i),
        message,
        current_account,
      )

      redirect_to admin_marketplace_listing_path(@marketplace_listing.id), notice: 'Marketplace Listing Status Changed'
    end

    private

    def set_marketplace_listing
      @marketplace_listing = MarketplaceListing.find(params[:id])
      @marketplace_listing_category = MarketplaceListingCategory.find(@marketplace_listing.marketplace_listing_category_id)
    end

    def filtered_marketplace_listings
      MarketplaceListingFilter.new(nil, nil, filter_params).results
    end

    def filter_params
      params.permit(
        :title,
        :id,
        :account_id,
        :description,
        :status,
      )
    end

  end
end
