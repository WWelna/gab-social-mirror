# frozen_string_literal: true

class Api::V1::BlockedbyController < Api::BaseController
    before_action :require_user!
  
    def index
      @accounts = load_accounts
      render json: @accounts
    end
  
    private
  
    def load_accounts
      Block
        .where(target_account: current_account)
        .pluck(:account_id)
        .map { |id| { id: id } }
    end
  
  end
  