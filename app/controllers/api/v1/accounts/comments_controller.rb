# frozen_string_literal: true

class Api::V1::Accounts::CommentsController < Api::BaseController
  # only current user viewable
  before_action :set_account
  before_action :validate_account!
  before_action :set_comments

  after_action :insert_pagination_headers, unless: -> { @comments.empty? }

  def index
    render json: @comments,
           each_serializer: REST::CommentSerializer,
           comment_relationships: CommentRelationshipsPresenter.new(@comments, current_user&.account_id)
  end

  private

  def set_account
    ActiveRecord::Base.connected_to(role: :reading) do
      @account = Account.find(params[:account_id])
    end
  end

  def validate_account!
    if current_account.nil?
      raise GabSocial::NotPermittedError, 'Not permitted'
    end
    if current_account.id.to_s != params[:account_id]
      raise GabSocial::NotPermittedError, 'Not permitted'
    end
    true
  end

  def set_comments
    @comments = cached_account_comments
  end

  def cached_account_comments
    cache_collection account_comments, Comment
  end

  def account_comments
    @account.comments.paginate_by_id(
      limit_param(DEFAULT_STATUSES_LIMIT),
      params_slice(:max_id, :since_id, :min_id)
    )
  end

  def pagination_params(core_params)
    params.slice(:limit).permit(:limit).merge(core_params)
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    api_v1_account_comments_url pagination_params(max_id: pagination_max_id)
  end

  def prev_path
    api_v1_account_comments_url pagination_params(min_id: pagination_since_id)
  end

  def pagination_max_id
    @comments.last.id
  end

  def pagination_since_id
    @comments.first.id
  end
end
