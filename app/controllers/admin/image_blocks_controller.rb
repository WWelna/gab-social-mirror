# frozen_string_literal: true

module Admin
    class ImageBlocksController < BaseController
      before_action :set_image_block, only: [:show, :destroy]
  
      def index
        authorize :image_block, :index?
        @image_blocks = ImageBlock.page(params[:page])
      end
  
      def new
        authorize :image_block, :create?
        @image_block = ImageBlock.new
      end
  
      def create
        authorize :image_block, :create?
  
        @image_block = ImageBlock.new(resource_params)
  
        if @image_block.save
          log_action :create, @image_block
          redirect_to admin_image_blocks_path, notice: 'image block created.'
        else
          render :new
        end
      end
  
      def destroy
        authorize @image_block, :destroy?
        @image_block.destroy!
        log_action :destroy, @image_block
        redirect_to admin_image_blocks_path, notice: 'image block deleted.'
      end
  
      private
  
      def set_image_block
        @image_block = ImageBlock.find(params[:id])
      end
  
      def filter_params
        params.permit(:md5)
      end
  
      def resource_params
        params.require(:image_block).permit(:md5)
      end
    end
  end
  