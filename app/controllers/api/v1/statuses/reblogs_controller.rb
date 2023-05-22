# frozen_string_literal: true

class Api::V1::Statuses::ReblogsController < Api::BaseController
  include Authorization

  before_action -> { doorkeeper_authorize! :write, :'write:statuses' }
  before_action :require_user!

  def create
    @relog = status_for_reblog
    ReblogService.new.call(current_user.account, @relog, reblog_params)
    render json: @relog, serializer: REST::StatusStatSerializer
  end

  def destroy
    @my_relog = status_for_destroy
    if @my_relog.nil?
      render json: { }, status: 206
      return
    end
    @original_status = @my_relog.reblog

    authorize @my_relog, :unreblog?

    RemovalWorker.perform_async(@my_relog.id)

    @reblogs_map = { @original_status.id => false }

    render json: @original_status,
           serializer: REST::StatusStatSerializer,
           unreblog: true,
           relationships: StatusRelationshipsPresenter.new([@original_status], current_user&.account_id, reblogs_map: @reblogs_map)
  end

  private

  def status_for_reblog
    Status.find(params[:status_id])
  rescue ActiveRecord::RecordNotFound
    raise GabSocial::ValidationError, 'The Gab you are trying to repost could not be found. It may have been deleted.'
  end

  def status_for_destroy
    begin
      current_user.account.statuses.where(reblog_of_id: params[:status_id]).first!
    rescue ActiveRecord::RecordNotFound
      #
    end
  end

  def reblog_params
    params.permit(:visibility, :status)
  end
end
