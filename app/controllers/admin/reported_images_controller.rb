# frozen_string_literal: true

module Admin
    class ReportedImagesController < BaseController
      before_action :set_report
  
      def create
        authorize :image_block, :create?
  
        @form = Form::ImageBlockBatch.new(form_image_block_batch_params.merge(action: action_from_button))
  
        if @form.save
          if action_from_button == 'block'
            flash[:alert] = 'Image blocks created.'
          else
            flash[:alert] = 'Image blocks deleted.'
          end
        end
  
        redirect_to admin_report_path(@report)
      rescue ActionController::ParameterMissing
        flash[:alert] = 'No images selected.'
  
        redirect_to admin_report_path(@report)
      end
  
      private
  
      def form_image_block_batch_params
        params.require(:form_image_block_batch).permit(md5s: [])
      end
  
      def action_from_button
        if params[:block]
          'block'
        elsif params[:unblock]
          'unblock'
        end
      end
  
      def set_report
        @report = Report.find(params[:report_id])
      end
    end
  end
  