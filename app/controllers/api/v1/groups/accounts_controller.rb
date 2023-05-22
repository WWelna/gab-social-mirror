# frozen_string_literal: true

class Api::V1::Groups::AccountsController < Api::BaseController
  include Authorization

  before_action -> { doorkeeper_authorize! :read, :'read:groups' }, only: [:show]
  before_action -> { doorkeeper_authorize! :write, :'write:groups' }, except: [:show]

  before_action :require_user!
  before_action :set_group

  after_action :insert_pagination_headers, only: :show

  def show
    @accounts = load_accounts
    render json: @accounts, each_serializer: REST::AccountSerializer
  end

  def create
    authorize @group, :join?

    if @group.is_paused?
      render json: { error: true, message: 'Unable to join group. Group is paused.' }, status: 422
    end

    if @group.has_password?
      # use the groups/password_controller to join group with password
      render json: { error: true, message: 'Unable to join group. Incorrect password.' }, status: 422
    else
      if @group.is_private
        @group.join_requests << current_account
      else
        @group.accounts << current_account
      end

      render json: @group, serializer: REST::GroupRelationshipSerializer, relationships: relationships
    end
  end

  def update
    authorize @group, :allow_if_is_group_admin_or_moderator?

    current_group_account = GroupAccount.where(group: @group, account_id: current_account.id).first
    target_role = group_account_params[:role]
    if target_role == "admin" and current_group_account.role != "admin"
      render json: { error: true, message: 'Unable to update role. You are not an admin.' }, status: 422
    else
      @account = @group.accounts.find(params[:account_id])
      GroupAccount.where(group: @group, account: @account).update(group_account_params)
      render_empty_success
    end
  end

  def destroy
    @join_request = GroupJoinRequest.where(group: @group, account_id: current_account.id)
    if @join_request.count > 0
      @join_request.destroy_all
    else
      authorize @group, :leave?
      GroupAccount.where(group: @group, account_id: current_account.id, role: nil).destroy_all
    end

    # : todo :
    # if has GroupQuestionAnswers delete those too

    render json: @group, serializer: REST::GroupRelationshipSerializer, relationships: relationships
  end

  private

  def relationships
    GroupRelationshipsPresenter.new([@group.id], current_user.account_id)
  end

  def set_group
    @group = Group.find(params[:group_id])
  end

  def load_accounts
    group_relationships = GroupRelationshipsPresenter.new([@group.id], current_user.account_id)
    is_admin_or_mod = group_relationships.admin[@group.id] == true or group_relationships.moderator[@group.id] == true
    if not is_admin_or_mod
      return []
    end
    if unlimited?
      @group.accounts.without_suspended.includes(:account_stat).all
    else
      @group.accounts.without_suspended.includes(:account_stat).paginate_by_max_id(limit_param(DEFAULT_ACCOUNTS_LIMIT), params[:max_id], params[:since_id])
    end
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    return if unlimited?

    if records_continue?
      api_v1_group_accounts_url pagination_params(max_id: pagination_max_id)
    end
  end

  def prev_path
    return if unlimited?

    unless @accounts.empty?
      api_v1_group_accounts_url pagination_params(since_id: pagination_since_id)
    end
  end

  def pagination_max_id
    @accounts.last.id
  end

  def pagination_since_id
    @accounts.first.id
  end

  def records_continue?
    @accounts.size == limit_param(DEFAULT_ACCOUNTS_LIMIT)
  end

  def pagination_params(core_params)
    params.slice(:limit).permit(:limit).merge(core_params)
  end

  def unlimited?
    params[:limit] == '0'
  end

  def group_account_params
    params.permit(:role, :write_permissions)
  end
end
