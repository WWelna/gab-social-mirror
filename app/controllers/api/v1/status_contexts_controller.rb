# frozen_string_literal: true

class Api::V1::StatusContextsController < Api::BaseController
  include Authorization

  before_action :require_user!

  def show
    status_contexts = StatusContext.is_global.is_enabled
    render json: status_contexts, each_serializer: REST::StatusContextSerializer
  end

end
