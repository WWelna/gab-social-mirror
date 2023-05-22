# frozen_string_literal: true

class Api::V1::Comments::ReactedByAccountsController < Api::BaseController
  include Authorization

  before_action :set_comment
  before_action :verify_own_comment
  after_action :insert_pagination_headers

  def index
    @accounts = load_accounts
    render json: @accounts, each_serializer: REST::AccountSerializer
  end

  private

  def load_accounts
    scope = default_accounts
    scope.merge(paginated_comment_reactions).to_a
  end

  def default_accounts
    Account
      .includes(:comment_reactions, :account_stat)
      .references(:comment_reactions)
      .where(comment_reactions: { comment_id: @comment.id })
  end

  def paginated_comment_reactions
    # basically if theres a reaction given, use it
    # else just load all (backwards compatiblity, too)
    # ...if the reaction is 1 (the first reaction_id should ALWAYS be a thumbs-up/like),
    #    then use [nil, 1].. nil = normal like
    reaction_id = params[:reaction_id]
    reaction_id = [nil, 1] if reaction_id.nil? || reaction_id.to_i < 2

    scope = CommentReaction
    scope = scope.where(reaction_id: reaction_id) if !params[:reaction_id].nil?
    scope = scope.paginate_by_max_id(
      limit_param(DEFAULT_ACCOUNTS_LIMIT),
      params[:max_id],
      params[:since_id]
    )
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    if records_continue?
      api_v1_comment_reacted_by_index_url pagination_params(max_id: pagination_max_id)
    end
  end

  def prev_path
    unless @accounts.empty?
      api_v1_comment_reacted_by_index_url pagination_params(since_id: pagination_since_id)
    end
  end

  def pagination_max_id
    @accounts.last.comment_reactions.last.id
  end

  def pagination_since_id
    @accounts.first.comment_reactions.first.id
  end

  def records_continue?
    @accounts.size == limit_param(DEFAULT_ACCOUNTS_LIMIT)
  end

  def set_comment
    @comment = Comment.find(params[:comment_id])
    authorize @comment, :show?
  rescue GabSocial::NotPermittedError
    raise ActiveRecord::RecordNotFound
  end

  def pagination_params(core_params)
    params
      .slice(:limit, :reaction_id)
      .permit(:limit, :reaction_id)
      .merge(core_params)
  end

  def verify_own_comment
    # OWN OR IF IS STAFF/ADMIN
    unless @comment.account.id == current_account.id || current_account.user&.staff?
      render json: {}, comment: 404
    end
  end
end
