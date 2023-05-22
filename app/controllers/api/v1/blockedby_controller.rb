# frozen_string_literal: true

class Api::V1::BlockedbyController < Api::BaseController
    before_action :require_user!
  
    def index
      render json: []
    end
  
end
  