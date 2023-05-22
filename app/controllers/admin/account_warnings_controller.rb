# frozen_string_literal: true

module Admin
  class AccountWarningsController < BaseController
    PER_PAGE = 40

    def index
      @account_warnings = filtered_account_warnings.page(params[:page]).per(PER_PAGE)
    end

    private

    def resource_params
      params.require(:account_warning).permit(
        :id,
        :text,
        # :action,
        :target_account_id,
      )
    end
  
    def filtered_account_warnings
      AccountWarningFilter.new(filter_params).results
    end

    def filter_params
      params.permit(
        :id,
        :text,
        # :action,
        :target_account_id,
      )
    end

  end
end
