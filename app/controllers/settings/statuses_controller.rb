# frozen_string_literal: true

class Settings::StatusesController < Settings::BaseController
  include Authorization

  layout 'admin'

  helper_method :current_params

  before_action :authenticate_user!
  
  PER_PAGE = 20

  def index
    @statuses = statuses_by_filters

    if filter_params[:delete_query_by_user] == "1"
      statuses = statuses_by_filters

      # Only allow max_deletes at a time
      max_deletes = 1000
      if statuses.length > max_deletes
        flash[:alert] = "Error. You can only delete #{max_deletes} statuses at a time"
        return redirect_to settings_statuses_path()
      end

      statuses.each { |status| authorize status, :update? }
      BatchedRemoveStatusesWorker.perform_async(current_user.account.id, statuses.map(&:id))
      return redirect_to settings_statuses_path(), notice: "Successfully deleted #{statuses.length} statuses. Changes may take a few seconds to take effect."
    end

    @statuses = @statuses.page(params[:page]).per(PER_PAGE)

    # authorize all before showing, but use "update?" since that's the action
    # need to make sure current user owns the statuses
    @statuses.each { |status| authorize status, :update? }
    
    @form = Form::StatusBatch.new
  end

  def create
    # authorize before performing anything updates
    statuses = nil

    if action_from_button == 'delete_by_user'
      statuses = Status.where(id: form_status_batch_params[:status_ids])
      statuses.each { |status| authorize status, :update? }
      BatchedRemoveStatusService.new.call(statuses, current_user.account, skip_side_effects: true)
    else
      raise GabSocial::NotPermittedError, 'Error. Invalid action.'
    end
    
    redirect_to settings_statuses_path(current_params), notice: "Successfully deleted #{statuses.length} statuses. Changes may take a few seconds to take effect."
  rescue ActionController::ParameterMissing
    flash[:alert] = I18n.t('admin.statuses.no_status_selected')

    redirect_to settings_statuses_path(current_params)
  end

  private

  def statuses_by_filters
    # ONLY CURRENT USER STATUSES!
    scope = current_user.account.statuses

    if !filter_params[:text].nil? && !filter_params[:text].empty?
      scope = scope.matching(:text, :contains, filter_params[:text])
    end
    if !filter_params[:created_at_lte].nil? && !filter_params[:created_at_lte].empty?
      scope = scope.where("created_at <= ?", filter_params[:created_at_lte])
    end
    if !filter_params[:created_at_gte].nil? && !filter_params[:created_at_gte].empty?
      scope = scope.where("created_at >= ?", filter_params[:created_at_gte])
    end
    if filter_params[:is_repost] == "on"
      scope = scope.where('statuses.reblog_of_id IS NOT NULL')
    end
    if filter_params[:is_comment] == "on"
      scope = scope.only_replies
    end
    if filter_params[:contains_poll] == "on"
      scope = scope.where('statuses.poll_id IS NOT NULL')
    end
    if filter_params[:contains_media] == "on"
      status_ids = current_user.account.statuses.joins(:media_attachments).distinct(:id).pluck(:id)
      scope = scope.where(id: status_ids)
    end

    if !filter_params[:sort].nil? && !filter_params[:sort].empty?
      if filter_params[:sort] == 'newest'
        scope = scope.recent
      elsif filter_params[:sort] == 'top'
        scope = scope.top  
      end
    end

    scope
  end

  def form_status_batch_params
    params.require(:form_status_batch).permit(:action, status_ids: [])
  end

  def current_params
    page = (params[:page] || 1).to_i

    {
      page: page > 1 && page,
    }.select { |_, value| value.present? }
  end

  def filter_params
    params.permit(
      :text,
      :created_at_lte,
      :created_at_gte,
      :is_repost,
      :is_comment,
      :contains_media,
      :contains_poll,
      :sort,
      :delete_query_by_user,
    )
  end

  def action_from_button
    if params[:delete_by_user]
      'delete_by_user'
    end
  end
end