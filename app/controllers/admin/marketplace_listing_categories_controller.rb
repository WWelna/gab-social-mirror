class Admin::MarketplaceListingCategoriesController < Admin::BaseController	
	before_action :set_category, except: [:index, :new, :create]

	def index
		@marketplace_listing_categories = MarketplaceListingCategory.all
	end

	def new
    # @categories = MarketplaceListingCategory.all # for setting parent categories
		@marketplace_listing_category = MarketplaceListingCategory.new
	end

	def show
		# 
	end

	def update
		if @marketplace_listing_category.update(resource_params)
			redirect_to admin_marketplace_listing_categories_path, notice: 'Updated'
		else
			render action: :show
		end
	end

	def create
		@marketplace_listing_category = MarketplaceListingCategory.new(resource_params)
		
		if @marketplace_listing_category.save
			log_action :create, @marketplace_listing_category
			redirect_to admin_marketplace_listing_categories_path, notice: "Success"
		else
			render :new
		end
	end

	def destroy
		@marketplace_listing_category.destroy!
		log_action :destroy, @marketplace_listing_category
		flash[:notice] = "Deleted"
		redirect_to admin_marketplace_listing_categories_path
	end

	private

	def set_category
		@marketplace_listing_category = MarketplaceListingCategory.find(params[:id])
	end

	def resource_params
		params.require(:marketplace_listing_category).permit(:name, :slug, :description, :cover_image)
	end

end
