# frozen_string_literal: true

class Api::V1::Lists::AccountsController < Api::BaseController
  before_action -> { doorkeeper_authorize! :read, :'read:lists' }, only: [:show]
  before_action -> { doorkeeper_authorize! :write, :'write:lists' }, except: [:show]

  before_action :require_user!
  before_action :set_list

  after_action :insert_pagination_headers, only: :show

  def show
    @accounts = load_accounts
    render json: @accounts, each_serializer: REST::AccountSerializer
  end

  def create
     # Must be list owner
     if @list.account_id != current_account.id
      raise GabSocial::NotPermittedError, 'Unable to perform action.'
    end

    # Don't allow if blocked
    if Block.where(account_id: params[:account_id], target_account: current_account).exists?
      raise GabSocial::NotPermittedError, 'Cannot add to feed. That account has you blocked.'
    end

    # Don't allow if user is locked/private and current_account not following
    if list_account.locked? && !current_account.following?(list_account)
      raise GabSocial::NotPermittedError, 'Cannot add to feed. That account is private and you are not following them.'
    end

    # Don't allow if user already removed themself from this list
    if ListRemovedAccount.where(list: @list, account_id: params[:account_id]).exists?
      raise GabSocial::NotPermittedError, 'Cannot add to feed. That account has removed themself.'
    end

    ApplicationRecord.transaction do
      @list.accounts << list_account
    end

    render json: @list, serializer: REST::ListMemberSerializer, member: true
  end

  def destroy
    # authorize either list owner of current account = params[:account_id]
    if @list.account_id === current_account.id || params[:account_id] === current_account.id
      ListAccount.where(list: @list, account_id: params[:account_id]).destroy_all
      render json: @list, serializer: REST::ListMemberSerializer, member: false
    else
      raise GabSocial::NotPermittedError, 'Unable to perform action.'
    end
  end

  def leave
    ApplicationRecord.transaction do
      @list.removed_accounts << current_account
      ListAccount.where(list: @list, account_id: current_account.id).destroy_all
    end
    render_empty_success
  end

  private

  def set_list
    @list = List.where(account: current_account).or(List.public_only).find(params[:list_id])
  end

  def load_accounts
    @list.accounts.includes(:account_stat).paginate_by_max_id(limit_param(DEFAULT_ACCOUNTS_LIMIT), params[:max_id], params[:since_id])
  end

  def list_account
    Account.find(params[:account_id])
  end

  def resource_params
    params.permit(:account_id)
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    if records_continue?
      api_v1_list_accounts_url pagination_params(max_id: pagination_max_id)
    end
  end

  def prev_path
    unless @accounts.empty?
      api_v1_list_accounts_url pagination_params(since_id: pagination_since_id)
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

end
