# frozen_string_literal: true

class Api::V2::NotificationsController < Api::BaseController
  before_action -> { doorkeeper_authorize! :read, :'read:notifications' }, only: [:index]
  before_action :require_user!
  before_action :set_filter_params
  after_action :insert_pagination_headers, only: :index

  DEFAULT_NOTIFICATIONS_LIMIT = 20

  def index
    @notifications = load_notifications
    render json: @notifications, each_serializer: REST::NotificationSerializer, relationships: StatusRelationshipsPresenter.new(target_statuses_from_notifications, current_user&.account_id)
  end

  private

  def load_notifications
    cache_collection paginated_notifications, Notification
  end

  def paginated_notifications
    browserable_account_notifications.paginate_by_id(
      limit_param(DEFAULT_NOTIFICATIONS_LIMIT),
      params_slice(:max_id, :since_id, :min_id)
    )
  end

  def browserable_account_notifications
    current_account.notifications.v2_browserable(
      current_account,
      params
    )
  end

  def target_statuses_from_notifications
    @notifications.reject { |notification| notification.target_status.nil? }.map(&:target_status)
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    unless @notifications.empty?
      api_v2_notifications_url pagination_params(max_id: pagination_max_id)
    end
  end

  def prev_path
    unless @notifications.empty?
      api_v2_notifications_url pagination_params(min_id: pagination_since_id)
    end
  end

  def pagination_max_id
    @notifications.last.id
  end

  def pagination_since_id
    @notifications.first.id
  end

  def set_filter_params
    params.permit(
      :before_date,
      :after_date,
      :is_verified,
      :is_following,
      account_ids: [],
      status_ids: [],
      group_ids: [],
      types: []
    )
  end

  def pagination_params(core_params)
    params
      .slice(:limit,  :before_date, :after_date, :is_following, :is_verified, :types, :account_ids, :status_ids, :group_ids)
      .permit(:limit, :before_date, :after_date, :is_following, :is_verified, types: [], account_ids: [], status_ids: [], group_ids: [])
      .merge(core_params)
  end
end
