# frozen_string_literal: true

class Api::V1::ReportsController < Api::BaseController
  before_action -> { doorkeeper_authorize! :write, :'write:reports' }, only: [:create]
  before_action :require_user!

  MAX_REPORTS_HOURLY_LIMIT = 30

  def create
    if hourly_limit_reached?(current_account)
      render json: { error: 'Hourly report limit reached, please try again later.' }, status: 429
      return
    end
    @report = ReportService.new.call(
      current_account,
      reported_account,
      status_ids: reported_status_ids,
      comment: report_params[:comment],
      forward: report_params[:forward],
      category: report_params[:category]
    )

    render json: {success: true}
  end

  private

  def hourly_limit_reached?(account)
    Report.where(account: account).where('created_at > ?', 1.hour.ago).count >= MAX_REPORTS_HOURLY_LIMIT
  end

  def reported_status_ids
    reported_account.statuses.find(status_ids).pluck(:id)
  end

  def status_ids
    Array(report_params[:status_ids])
  end

  def reported_account
    Account.find(report_params[:account_id])
  end

  def report_params
    params.permit(:account_id, :comment, :forward, :category, status_ids: [])
  end
end
