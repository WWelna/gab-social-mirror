# frozen_string_literal: true

module Admin
  class ReportsController < BaseController
    before_action :set_report, except: [:index]

    def index
      authorize :report, :index?
      @reports = filtered_reports.page(params[:page])
      @categories = ReportFilter.new(filter_params.except(:category)).results.order('category nulls first').group(:category).count
    end

    def show
      authorize @report, :show?

      @report_note  = @report.notes.new
      @report_notes = (@report.notes.latest + @report.history + @report.target_account.targeted_account_warnings.latest.custom).sort_by(&:created_at)
      @form         = Form::StatusBatch.new

      @link_block_form = Form::LinkBlockBatch.new
      @blockable_links = @report.statuses.
        flat_map { |s| LinkBlock.blockable_links(s.text) }.
        uniq.
        sort
      @blocked_links = if @blockable_links.present?
        LinkBlock.where(link: @blockable_links).pluck(:link)
      else
        []
      end

      @image_block_form = Form::ImageBlockBatch.new
      @blockable_images = MediaAttachment.where(status: @report.statuses).pluck(:file_fingerprint)
      @blocked_images = if @blockable_images.present?
        ImageBlock.pluck(:md5)
      else
        []
      end
      
    end

    def assign_to_self
      authorize @report, :update?
      @report.update!(assigned_account_id: current_account.id)
      log_action :assigned_to_self, @report
      redirect_to admin_report_path(@report)
    end

    def unassign
      authorize @report, :update?
      @report.update!(assigned_account_id: nil)
      log_action :unassigned, @report
      redirect_to admin_report_path(@report)
    end

    def reopen
      authorize @report, :update?
      @report.unresolve!
      log_action :reopen, @report
      redirect_to admin_report_path(@report)
    end

    def resolve
      authorize @report, :update?
      @report.resolve!(current_account)
      log_action :resolve, @report
      redirect_to admin_reports_path, notice: I18n.t('admin.reports.resolved_msg')
    end

    private

    def filtered_reports
      ReportFilter.new(filter_params).results.order(id: :desc).includes(:account, :target_account)
    end

    def filter_params
      params.permit(
        :account_id,
        :resolved,
        :comment,
        :target_account_id,
        :category
      )
    end

    def set_report
      @report = Report.find(params[:id])
    end
  end
end
