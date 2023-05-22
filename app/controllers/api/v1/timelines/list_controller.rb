# frozen_string_literal: true

class Api::V1::Timelines::ListController < Api::BaseController
  include Authorization

  before_action :set_list
  before_action :set_statuses

  after_action :insert_pagination_headers, unless: -> { @statuses.empty? }

  def show
    if !current_user.nil?
      render json: @statuses,
            each_serializer: REST::StatusSerializer,
            relationships: StatusRelationshipsPresenter.new(@statuses, current_user.account_id)
    else
      render json: @statuses, each_serializer: REST::StatusSerializer
    end
  end

  private

  def set_list
    @list = nil

    if !current_account.nil?
      @list = List.where(account: current_account).or(List.public_only).find(params[:id])
    else
      @list = List.public_only.find(params[:id])
    end

    authorize @list, :show?

    @accounts = ListAccount.select('account_id').where(list_id: @list)
  end

  def set_statuses
    @statuses = cached_list_statuses
    @statuses = @statuses.reject { |status| status.proper.nil? }
  end

  def cached_list_statuses
    cache_collection list_statuses, Status
  end

  def list_statuses
    statuses = Status.where(
      account: @accounts, reply: false
    ).since(10.days.ago)

    if current_account.nil?
      statuses = statuses.with_public_visibility
    end

    statuses = statuses.paginate_by_id(
      limit_param(DEFAULT_STATUSES_LIMIT),
      params_slice(:max_id, :since_id, :min_id)
    )

    if !current_account.nil?
      statuses = statuses.reject { |status| FeedManager.instance.filter?(:home, status, current_account.id) }
    end
    statuses
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def pagination_params(core_params)
    params.slice(:limit).permit(:limit).merge(core_params)
  end

  def next_path
    api_v1_timelines_list_url params[:id], pagination_params(max_id: pagination_max_id)
  end

  def prev_path
    api_v1_timelines_list_url params[:id], pagination_params(min_id: pagination_since_id)
  end

  def pagination_max_id
    @statuses.last.id
  end

  def pagination_since_id
    @statuses.first.id
  end
end
