# frozen_string_literal: true

class Api::V1::BookmarkCollections::BookmarksController < Api::BaseController
  before_action -> { doorkeeper_authorize! :read, :'read:bookmarks' }
  before_action :require_user!
  after_action :insert_pagination_headers

  def index
    @statuses = load_statuses
    render json: @statuses, each_serializer: REST::StatusSerializer, relationships: StatusRelationshipsPresenter.new(@statuses, current_user&.account_id)
  end

  def create
    # update status bookmark collection id
    current_account.status_bookmarks
      .where(status_id: params[:statusId])
      .update(status_bookmark_collection_id: params[:bookmark_collection_id])
    render_empty_success
  end

  private

  def load_statuses
    ActiveRecord::Base.connected_to(role: :reading) do
      cached_bookmarks
    end
  end

  def cached_bookmarks
    cache_collection(
      Status.reorder(nil).joins(:status_bookmarks).merge(results),
      Status
    )
  end

  def results
    @_results ||= account_bookmarks.paginate_by_id(
      limit_param(DEFAULT_STATUSES_LIMIT),
      params_slice(:max_id, :since_id, :min_id)
    )
  end

  def account_bookmarks
    current_account.status_bookmarks.where(status_bookmark_collection_id: passed_bookmark_id)
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    api_v1_bookmark_collection_bookmarks_url pagination_params(max_id: pagination_max_id) if records_continue?
  end

  def prev_path
    api_v1_bookmark_collection_bookmarks_url pagination_params(since_id: pagination_since_id) unless results.empty?
  end

  def pagination_max_id
    results.last.id
  end

  def pagination_since_id
    results.first.id
  end

  def records_continue?
    results.size == limit_param(DEFAULT_STATUSES_LIMIT)
  end

  def pagination_params(core_params)
    params.slice(:limit).permit(:limit).merge(core_params)
  end

  def passed_bookmark_id
    the = params[:bookmark_collection_id]
    return nil if the == 'saved'
    return the
  end

end
