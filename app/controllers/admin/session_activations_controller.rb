# frozen_string_literal: true

module Admin
  class SessionActivationsController < BaseController
    before_action :set_account

    PER_PAGE = 50

    def index
      authorize :account, :index?
      @session_activations = @account.user.session_activations.recent.page(params[:page]).per(PER_PAGE)
      @form = Form::SessionActivationBatch.new
    end

  
    def create
      authorize :status, :update?

      @form         = Form::SessionActivationBatch.new(form_session_activation_batch_params.merge(current_account: current_account, action: 'revoke'))
      flash[:alert] = 'Failed to perform action' unless @form.save

      redirect_to admin_account_session_activations_path(@account.id)
    rescue ActionController::ParameterMissing
      flash[:alert] = 'No session selected'

      redirect_to admin_account_sessions_path(@account.id)
    end

    def form_session_activation_batch_params
      params.require(:form_session_activation_batch).permit(:action, session_activation_ids: [])
    end

    private

    def set_account
      @account = Account.find(params[:account_id])
    end

  end
end
