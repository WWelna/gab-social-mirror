# frozen_string_literal: true

module Admin
  class ReportedLinksController < BaseController
    before_action :set_report

    def create
      authorize :link_block, :create?

      @form = Form::LinkBlockBatch.new(form_link_block_batch_params.merge(current_account: current_account, action: action_from_button))

      if @form.save
        if action_from_button == 'block'
          flash[:alert] = I18n.t('admin.link_blocks.created_msg')
        else
          flash[:alert] = I18n.t('admin.link_blocks.destroyed_msg')
        end
      end

      redirect_to admin_report_path(@report)
    rescue ActionController::ParameterMissing
      flash[:alert] = I18n.t('admin.link_blocks.no_links_selected')

      redirect_to admin_report_path(@report)
    end

    private

    def form_link_block_batch_params
      params.require(:form_link_block_batch).permit(links: [])
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
