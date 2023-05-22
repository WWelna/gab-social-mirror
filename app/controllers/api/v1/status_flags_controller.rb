# frozen_string_literal: true

class Api::V1::StatusFlagsController < Api::BaseController
  include Authorization

  before_action :require_user!
  before_action :set_status, only: [:show]

  def show
    render json: @status, serializer: REST::StatusFlagsSerializer
  end

  private

  def set_status
    @status = Status.find(params[:id])
    authorize @status, :show?
  rescue GabSocial::NotPermittedError
    raise ActiveRecord::RecordNotFound
  end

end
