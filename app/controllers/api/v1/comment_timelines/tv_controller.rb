# frozen_string_literal: true

class Api::V1::CommentTimelines::TvController < Api::BaseController
  before_action :require_user!
  before_action :set_comments

  after_action :insert_pagination_headers, unless: -> { @comments.empty? }

  def show
    render json: @comments,
           each_serializer: REST::CommentSerializer,
           comment_relationships: CommentRelationshipsPresenter.new(@comments, current_user.account_id)
  end

  private

  def set_comments
    @comments = cached_tv_comments
  end

  def cached_tv_comments
    cache_collection tv_comments, Comment
  end

  def tv_comments
    Comment.where(source_id: params[:id], source: :tv_video).paginate_by_id(
      limit_param(DEFAULT_STATUSES_LIMIT),
      params_slice(:max_id, :since_id, :min_id)
    )
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def pagination_params(core_params)
    params.slice(:limit).permit(:limit).merge(core_params)
  end

  def next_path
    api_v1_comment_timelines_tv_url params[:id], pagination_params(max_id: pagination_max_id)
  end

  def prev_path
    api_v1_comment_timelines_tv_url params[:id], pagination_params(min_id: pagination_since_id)
  end

  def pagination_max_id
    @comments.last.id
  end

  def pagination_since_id
    @comments.first.id
  end
end
