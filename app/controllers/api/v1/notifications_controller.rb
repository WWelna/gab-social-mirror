# frozen_string_literal: true

class Api::V1::NotificationsController < Api::BaseController
  before_action -> { doorkeeper_authorize! :read, :'read:notifications' }, except: [:clear, :mark_read]
  before_action -> { doorkeeper_authorize! :write, :'write:notifications' }, only: [:clear, :mark_read]
  before_action :require_user!
  before_action :set_filter_params
  after_action :insert_pagination_headers, only: :index

  DEFAULT_NOTIFICATIONS_LIMIT = 20

  def index
    @notifications = load_notifications
    render json: @notifications, each_serializer: REST::NotificationSerializer, relationships: StatusRelationshipsPresenter.new(target_statuses_from_notifications, current_user&.account_id)
  end

  def show
    @notification = current_account.notifications.find(params[:id])
    render json: @notification, serializer: REST::NotificationSerializer
  end

  def clear
    current_account.notifications.delete_all
    render_empty_success
  end

  def mark_read
    if !params[:id].nil? and !current_account.user.nil?
      conn = ActiveRecord::Base.connection
      conn.exec_query "update users set last_read_notification = #{params[:id].to_i} where id = #{current_account.user.id}"
    end
    # current_account.notifications.find(params[:id]).mark_read!
    render_empty_success
  end

  private

  def load_notifications
    cache_collection paginated_notifications, Notification
  end

  def paginated_notifications
    if params[:max_id] && params[:max_id].present?
      # dont use "latest" if not first load
      browserable_account_notifications.paginate_by_id(
        limit_param(DEFAULT_NOTIFICATIONS_LIMIT),
        params_slice(:max_id, :since_id, :min_id)
      )
    else
      # USE "latest" if IS first load
      browserable_account_notifications.latest.paginate_by_id(
        limit_param(DEFAULT_NOTIFICATIONS_LIMIT),
        params_slice(:max_id, :since_id, :min_id)
      )
    end
  end

  def browserable_account_notifications
    current_account
      .notifications
      .browserable(
        exclude_types,
        from_account,
        params[:only_verified],
        params[:only_following],
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
      api_v1_notifications_url pagination_params(max_id: pagination_max_id)
    end
  end

  def prev_path
    unless @notifications.empty?
      api_v1_notifications_url pagination_params(min_id: pagination_since_id)
    end
  end

  def pagination_max_id
    @notifications.last.id
  end

  def pagination_since_id
    @notifications.first.id
  end

  def exclude_types
    val = params.permit(exclude_types: [])[:exclude_types] || []
    val = [val] unless val.is_a?(Enumerable)
    val
  end

  def set_filter_params
    params.permit(
      :only_verified,
      :only_following,
      :max_id
    )
  end

  def from_account
    params[:account_id]
  end

  def pagination_params(core_params)
    params.slice(:limit, :exclude_types).permit(:limit, exclude_types: []).merge(core_params)
  end
end
