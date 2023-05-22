# frozen_string_literal: true

class Api::V1::StatusStatsController < Api::BaseController
  include Authorization

  def show
    Status.uncached do
      @status = Status.find(params[:id])
    end
    render json: @status, serializer: REST::StatusStatSerializer
  rescue GabSocial::NotPermittedError
    raise ActiveRecord::RecordNotFound
  end

end
