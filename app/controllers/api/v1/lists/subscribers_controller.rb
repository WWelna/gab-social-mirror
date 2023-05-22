# frozen_string_literal: true

class Api::V1::Lists::SubscribersController < Api::BaseController
  before_action -> { doorkeeper_authorize! :read, :'read:lists' }, only: [:show]
  before_action -> { doorkeeper_authorize! :write, :'write:lists' }, except: [:show]

  before_action :require_user!
  before_action :set_list

  after_action :insert_pagination_headers, only: :show

  def show
    @subscribers = load_subscribers
    render json: @subscribers, each_serializer: REST::AccountSerializer
  end

  def create
    if Block.where(account_id: params[:account_id], target_account: current_account).exists?
      raise GabSocial::NotPermittedError, 'Cannot add to list. That account has you blocked.'
    else
      cur_subs = @list.subscriber_count
      ApplicationRecord.transaction do
        @list.subscribers << current_account
      end
      render json: {
        id: @list.id.to_s,
        subscriber_count: cur_subs + 1,
        subscriber: true
      }
    end
  end

  def destroy
    cur_subs = @list.subscriber_count
    ListSubscriber.where(list: @list, account: current_account).destroy_all
    render json: {
      id: @list.id.to_s,
      subscriber_count: cur_subs - 1,
      subscriber: false
    }
  end

  private

  def set_list
    @list = List.where(account: current_account).or(List.public_only).find(params[:list_id])
  end

  def load_subscribers
    @list.subscribers.includes(:account_stat).paginate_by_max_id(limit_param(DEFAULT_ACCOUNTS_LIMIT), params[:max_id], params[:since_id])
  end

  def resource_params
    params.permit(:account_id)
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    if records_continue?
      api_v1_list_subscribers_url pagination_params(max_id: pagination_max_id)
    end
  end

  def prev_path
    unless @subscribers.empty?
      api_v1_list_subscribers_url pagination_params(since_id: pagination_since_id)
    end
  end

  def pagination_max_id
    @subscribers.last.id
  end

  def pagination_since_id
    @subscribers.first.id
  end

  def records_continue?
    @subscribers.size == limit_param(DEFAULT_ACCOUNTS_LIMIT)
  end

  def pagination_params(core_params)
    params.slice(:limit).permit(:limit).merge(core_params)
  end

  def unlimited?
    params[:limit] == '0'
  end
end
