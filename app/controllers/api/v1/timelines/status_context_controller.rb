# frozen_string_literal: true

class Api::V1::Timelines::StatusContextController < Api::BaseController
  include Authorization

  before_action :require_user!
  before_action :set_statuses

  after_action :insert_pagination_headers, unless: -> { @statuses.empty? }

  def show
    render json: @statuses, each_serializer: REST::StatusSerializer
  end

  private

  def set_statuses
    @statuses = cached_statuses
  end

  def cached_statuses
    cache_collection the_statuses, Status
  end

  def the_statuses
    statuses = Status.where(
      status_context_id: params[:id],
      reply: false
    ).since(10.days.ago)

    statuses = statuses.paginate_by_id(
      limit_param(DEFAULT_STATUSES_LIMIT),
      params_slice(:max_id, :since_id, :min_id)
    )

    statuses
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def pagination_params(core_params)
    params.slice(:limit, :id).permit(:limit, :id).merge(core_params)
  end

  def next_path
    api_v1_timelines_status_context_url params[:id], pagination_params(max_id: pagination_max_id)
  end

  def prev_path
    api_v1_timelines_status_context_url params[:id], pagination_params(min_id: pagination_since_id)
  end

  def pagination_max_id
    @statuses.last.id
  end

  def pagination_since_id
    @statuses.first.id
  end
end
