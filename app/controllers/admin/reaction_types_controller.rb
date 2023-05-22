class Admin::ReactionTypesController < Admin::BaseController	
	before_action :set_category, except: [:index, :new, :create]

	def index
		@reaction_types = ReactionType.order_by_index.all
	end

	def new
		@reaction_type = ReactionType.new
	end

	def show
		# 
	end

	def update
		if @reaction_type.update(resource_params)
			redirect_to admin_reaction_types_path, notice: 'Updated'
		else
			render action: :show
		end
	end

	def create
		@reaction_type = ReactionType.new(resource_params)
		
		if @reaction_type.save
			log_action :create, @reaction_type
			redirect_to admin_reaction_types_path, notice: "Success"
		else
			render :new
		end
	end

	private

	def set_category
		@reaction_type = ReactionType.find(params[:id])
	end

	def resource_params
		params.require(:reaction_type).permit(:name, :name_past, :name_plural, :slug, :index, :active_start_date, :active_end_date, :image)
	end

end
