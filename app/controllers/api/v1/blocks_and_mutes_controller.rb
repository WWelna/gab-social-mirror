# frozen_string_literal: true

class Api::V1::BlocksAndMutesController < Api::BaseController
  before_action :require_user!

  def index
    render json: {
      b: current_account.blocking.pluck(:id),
      bb: current_account.blocked_by.pluck(:id),
      m: current_account.muting.pluck(:id)
    }
  end

end
