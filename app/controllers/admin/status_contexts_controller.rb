class Admin::StatusContextsController < Admin::BaseController	
	before_action :set_category, except: [:index, :new, :create]

	def index
		@status_contexts = StatusContext.order_by_index.all
	end

	def new
		@status_context = StatusContext.new
	end

	def show
		# 
	end

	def update
		if @status_context.update(
      index: resource_params[:index],
      is_enabled: resource_params[:is_enabled],
    )
			redirect_to admin_status_contexts_path, notice: 'Updated'
		else
			render action: :show
		end
	end

	def create
		@status_context = StatusContext.new(resource_params.merge(
      owner_type: :account,
      owner_id: current_account.id,
      is_global: true,
    ))
		
		if @status_context.save
			log_action :create, @status_context
			redirect_to admin_status_contexts_path, notice: "Success"
		else
			render :new
		end
	end

	private

	def set_category
		@status_context = StatusContext.find(params[:id])
	end

	def resource_params
		params.require(:status_context).permit(:name, :index, :is_enabled)
	end

end
