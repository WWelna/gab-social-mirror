# frozen_string_literal: true

class Api::V1::WarningsController < Api::BaseController
  before_action :require_user!
  before_action :set_warning, except: [:index, :new_unread_warnings_count]
  after_action :insert_pagination_headers, only: :index

  def index
    @warnings = load_warnings
    render json: @warnings, each_serializer: REST::AccountWarningSerializer
  end

  def show
    render json: @warning, serializer: REST::AccountWarningSerializer
  end

  def destroy
    @warning.update!(user_dismissed_at: Time.now)
    render json: { error: false, id: params[:id] }
  end

  def new_unread_warnings_count
    count = AccountWarning
      .user_visible_warnings
      .not_dismissed
      .where(target_account: current_account)
      .count
    render json: count
  end

  def dismiss
    @warning.update!(user_dismissed_at: Time.now)
    render_empty_success
  end

  private

  def load_warnings
    cache_collection paginated_warnings, AccountWarning
  end

  def paginated_warnings
    AccountWarning.user_visible_warnings.not_dismissed.where(target_account: current_account).paginate_by_id(
    limit_param(DEFAULT_ACCOUNT_WARNINGS_LIMIT),
      params_slice(:max_id, :since_id, :min_id)
    )
  end

  def set_warning
    @warning = AccountWarning.user_visible_warnings.where(target_account: current_account).find(params[:id])
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    unless @warnings.empty?
      api_v1_warnings_url pagination_params(max_id: pagination_max_id)
    end
  end

  def prev_path
    unless @warnings.empty?
      api_v1_warnings_url pagination_params(min_id: pagination_since_id)
    end
  end

  def pagination_params(core_params)
    params.slice(:limit).permit(:limit).merge(core_params)
  end

  def pagination_max_id
    @warnings.last.id
  end

  def pagination_since_id
    @warnings.first.id
  end
end
