# frozen_string_literal: true

module Admin
  class ListsController < BaseController
    before_action :set_list, except: [:index]
  
    def index
      authorize :list, :index?
      @lists = filtered_lists.page(params[:page])
    end

    def show
      authorize :list, :index?
    end

    def update
      if @list.update(resource_params)
        redirect_to admin_list_path(@list.id), notice: I18n.t('generic.changes_saved_msg')
      else
        render action: :edit
      end
    end
  
    def destroy
      authorize @list, :destroy?
      @list.destroy!
      log_action :destroy, @list
      flash[:notice] = 'List destroyed'
      redirect_to admin_lists_path
    end
  
    private
  
    def set_list
      @list = List.find(params[:id])
    end
  
    def resource_params
      params.require(:list).permit(
        :title,
        :slug,
        :is_featured,
      )
    end
  
    def filtered_lists
      ListFilter.new(filter_params).results
    end

    def filter_params
      params.permit(
        :id,
        :slug,
        :title,
      )
    end
  end
end
  