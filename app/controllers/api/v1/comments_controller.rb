# frozen_string_literal: true

class Api::V1::CommentsController < Api::BaseController
  include Authorization

  before_action :require_user!
  before_action :set_status, only: [:show]
  after_action :insert_pagination_headers, only: :show

  COMMENT_SORTING_TYPE_NEWEST = 'newest'
  COMMENT_SORTING_TYPE_OLDEST = 'oldest'
  COMMENT_SORTING_TYPE_TOP = 'most-liked'

  def show
    @comments = load_comments

    render json: @comments,
           each_serializer: REST::StatusSerializer,
           relationships: StatusRelationshipsPresenter.new(@comments, current_user&.account_id)
  end


  private

  def load_comments
    cache_collection paginated_comments, Status
  end

  def paginated_comments
    if @status.reply
      # if reply just get all for now like normal
      return @status.descendants(512, current_account)
    end

    limit = 3
    if params[:max_id] && params[:max_id].present?
      limit = DEFAULT_COMMENTS_LIMIT
    end

    c = Status.unscoped
    c = c.where(in_reply_to_id: @status.id)

    if @status.reply || params[:sort_by] == COMMENT_SORTING_TYPE_NEWEST || params[:sort_by].empty? || params[:sort_by].nil?
      c = c.recent
      c = c.where(Status.arel_table[:id].lt(params[:max_id])) if params[:max_id]
      c = c.limit(limit)
    elsif params[:sort_by] == COMMENT_SORTING_TYPE_OLDEST
      c = c.oldest
      c = c.where(Status.arel_table[:id].gt(params[:max_id])) if params[:max_id]
      c = c.limit(limit)
    elsif params[:sort_by] == COMMENT_SORTING_TYPE_TOP
      # use max_id as "page"
      page = 1
      if params[:max_id]
        page = params[:max_id].to_i
      end

      c = c.page(page)
      c = c.per(10) # needs to be the same for all pagination
      c = c.top
    end

    c
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    unless @comments.empty?
      api_v1_comment_path pagination_params(max_id: pagination_max_id)
    end
  end

  def prev_path
    unless @comments.empty?
      api_v1_comment_path pagination_params(min_id: pagination_since_id)
    end
  end

  def pagination_max_id
    if params[:sort_by] == COMMENT_SORTING_TYPE_TOP
      if params[:max_id]
        page = params[:max_id].to_i
        return page + 1
      else
        return 2
      end
    else
      @comments.last.id
    end
  end

  def pagination_since_id
    @comments.first.id
  end

  def pagination_params(core_params)
    params.slice(:limit, :sort_by).permit(:limit, :sort_by).merge(core_params)
  end

  def set_status
    @status = Status.find(params[:id])
    authorize @status, :show?
  rescue GabSocial::NotPermittedError
    raise ActiveRecord::RecordNotFound
  end

end
