# frozen_string_literal: true

class Api::V1::Accounts::StatusesController < Api::BaseController
  before_action -> { authorize_if_got_token! :read, :'read:statuses' }
  before_action :set_account
  before_action :set_sort_type, if: -> { is_sorting_query_builder_able? }
  after_action :insert_pagination_headers, if: -> { !is_sorting_query_builder_able? }

  def index
    if paginating && current_account.nil?
      return render json: { "error": true }, status: 429
    end

    @statuses = load_statuses
    @statuses = @statuses.reject { |status| status.proper.nil? }

    render json: @statuses,
           each_serializer: REST::StatusSerializer,
           relationships: StatusRelationshipsPresenter.new(@statuses, current_user&.account_id)
  end

  private

  def set_account
    ActiveRecord::Base.connected_to(role: :reading) do
      @account = Account.find(params[:account_id])
    end
  end

  def load_statuses
    ActiveRecord::Base.connected_to(role: :reading) do
      cached_account_statuses
    end
  end

  def cached_account_statuses
    cache_collection account_statuses, Status
  end

  def account_statuses
    # : todo : if no current_user, limit date and no: tagged, reblogs, comments
    statuses = truthy_param?(:pinned) ?
      @account.pinned_statuses :
      @account.statuses

    max_id = params[:max_id]
    min_id = params[:min_id]

    if logged_in
      # only a logged in user can paginate
      if max_id != nil
        statuses = statuses.where(Status.arel_table[:id].lt(max_id))
      elsif min_id != nil
        statuses = statuses.where(Status.arel_table[:id].gt(min_id))
      end
    end

    if truthy_param?(:only_media) && logged_in
      statuses = statuses.where(id: account_media_status_ids)
    elsif truthy_param?(:only_comments)
      statuses = statuses.where(reply: true)
    else
      statuses = statuses.where(reply: false)
    end

    if is_sorting_query_builder_able?
      # only show 1 page if no user
      page = if current_account
        params[:page].to_i
      else
        [params[:page].to_i.abs, MIN_UNAUTHENTICATED_PAGES].min
      end
    
      statuses = statuses.merge(SortingQueryBuilder.new.call(@sort_type, nil, page, "account:#{@account.id.to_s}", {
        source_account_id: @account.id,
        current_account: current_account,
      }))
      return statuses
    else
      return statuses.limit(computed_limit)
    end
  end

  def account_media_status_ids
    # `SELECT DISTINCT id, updated_at` is too slow, so pluck ids at first, and then select id, updated_at with ids.
    # Also, Avoid getting slow by not narrowing down by `statuses.account_id`.
    # When narrowing down by `statuses.account_id`, `index_statuses_20180106` will be used
    # and the table will be joined by `Merge Semi Join`, so the query will be slow.
    @account.statuses.joins(:media_attachments)
            .merge(account_media_ids_query)
            .paginate_by_max_id(limit_param(DEFAULT_STATUSES_LIMIT), params[:max_id], params[:since_id])
            .reorder(id: :desc).distinct(:id).pluck(:id)
  end

  def account_media_ids_query
    if params[:media_type] == 'video'
      @account.media_attachments.where(type: 2)
    else
      @account.media_attachments.where.not(type: 2)
    end
  end

  def pagination_params(core_params)
    params.slice(
      :limit,
      :only_media,
      :only_comments
    ).permit(
      :limit,
      :only_media,
      :only_comments
    ).merge(core_params)
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path) unless logged_out
  end

  def next_path
    if @statuses.size == computed_limit
      api_v1_account_statuses_url pagination_params(max_id: @statuses.last.id)
    end
  end

  def prev_path
    unless @statuses.empty?
      api_v1_account_statuses_url pagination_params(min_id: @statuses.first.id)
    end
  end

  def logged_out
    current_account.nil?
  end

  def logged_in
    !logged_out
  end

  def computed_limit
    logged_in ? limit_param(DEFAULT_STATUSES_LIMIT) : 8
  end

  def paginating
    return params[:max_id] || params[:since_id] || params[:min_id]
  end

  def set_sort_type
    @sort_type = 'newest'
    @sort_type = params[:sort_by] if [
      'newest',
      'no-reposts',
      'top_today',
      'top_weekly',
      'top_monthly',
      'top_yearly',
      'top_all_time',
    ].include? params[:sort_by]

    return @sort_type
  end

  # only SQB on main timeline. NOT media, comments or pinned
  def is_sorting_query_builder_able?
    !truthy_param?(:only_media) && !truthy_param?(:only_comments) && !truthy_param?(:pinned)
  end

end
