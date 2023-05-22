# frozen_string_literal: true

module Admin
  class AccountStatusesController < BaseController
    helper_method :current_params

    before_action :set_account

    PER_PAGE = 20

    def index
      authorize :status, :index?

      @statuses = @account.statuses

      if params[:media]
        account_media_status_ids = @account.media_attachments.attached.reorder(nil).select(:status_id).distinct
        @statuses.merge!(Status.where(id: account_media_status_ids))
      end

      @statuses = @statuses.preload(:media_attachments, :mentions).page(params[:page]).per(PER_PAGE)
      @form     = Form::StatusBatch.new
    end

    def show
      authorize :status, :index?

      status_id = params[:id]
      @statuses = @account.statuses.where(id: status_id)
      authorize @statuses.first, :show?

      favQuery = <<-SQL
      select
        f.id as favourite_id,
        f.created_at as favourite_created_at,
        a.id as account_id,
        a.username,
        a.display_name,
        u.id as user_id,
        u.created_at as user_created_at,
        u.current_sign_in_ip::text,
        u.last_sign_in_ip::text
      from
        favourites f,
        accounts a,
        users u
      where
        f.status_id = ? and
        a.id = f.account_id and
        u.account_id = a.id
      SQL

      @favourites = Favourite.find_by_sql([favQuery, status_id])

      @form = Form::StatusBatch.new
    end

    def create
      authorize :status, :update?

      @form         = Form::StatusBatch.new(form_status_batch_params.merge(current_account: current_account, action: action_from_button))
      flash[:alert] = I18n.t('admin.statuses.failed_to_execute') unless @form.save

      redirect_to admin_account_account_statuses_path(@account.id, current_params)
    rescue ActionController::ParameterMissing
      flash[:alert] = I18n.t('admin.statuses.no_status_selected')

      redirect_to admin_account_account_statuses_path(@account.id, current_params)
    end

    private

    def form_status_batch_params
      params.require(:form_status_batch).permit(:action, status_ids: [])
    end

    def set_account
      @account = Account.find(params[:account_id])
    end

    def current_params
      page = (params[:page] || 1).to_i

      {
        media: params[:media],
        page: page > 1 && page,
      }.select { |_, value| value.present? }
    end

    def action_from_button
      if params[:nsfw_on]
        'nsfw_on'
      elsif params[:nsfw_off]
        'nsfw_off'
      elsif params[:delete]
        'delete'
      elsif params[:tombstone]
        'tombstone'
      end
    end
  end
end
