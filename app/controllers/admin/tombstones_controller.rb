# frozen_string_literal: true

module Admin
  class TombstonesController < BaseController
    helper_method :current_params

    PER_PAGE = 20

    def index
      authorize :status, :index?

      @statuses = filtered_statuses.preload(:media_attachments, :mentions).page(params[:page]).per(PER_PAGE)
      @form     = Form::StatusBatch.new
    end

    def show
      authorize :status, :index?

      @statuses = @account.statuses.where(id: params[:id])
      authorize @statuses.first, :show?

      @form = Form::StatusBatch.new
    end

    def create
      authorize :status, :update?

      @form         = Form::StatusBatch.new(form_status_batch_params.merge(current_account: current_account, action: action_from_button))
      flash[:alert] = I18n.t('admin.statuses.failed_to_execute') unless @form.save

      redirect_to admin_tombstones_path(current_params)
    rescue ActionController::ParameterMissing
      flash[:alert] = I18n.t('admin.statuses.no_status_selected')

      redirect_to admin_tombstones_path(current_params)
    end

    private

    def form_status_batch_params
      params.require(:form_status_batch).permit(:action, status_ids: [])
    end

    def filtered_statuses
      StatusFilter.new(nil, nil, nil, filter_params).unscoped_results.tombstoned.recent
    end

    def current_params
      page = (params[:page] || 1).to_i

      {
        media: params[:media],
        page: page > 1 && page,
      }.select { |_, value| value.present? }
    end

    def filter_params
      params.permit(
        :text,
        :id,
        :account_id,
        :group_id,
        :preview_card_id,
        :created_at_lte,
        :created_at_gte
      )
    end

    def action_from_button
      if params[:delete]
        'delete'
      elsif params[:un_tombstone]
        'un_tombstone'
      end
    end

  end
end
