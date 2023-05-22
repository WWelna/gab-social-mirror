# frozen_string_literal: true

module Admin
  class CommentsController < BaseController
    helper_method :current_params

    PER_PAGE = 20

    def index
      authorize :comment, :index?

      @comments = filtered_comments.page(params[:page]).per(PER_PAGE)
      @form = Form::CommentBatch.new
    end

    def show
      authorize :comment, :index?

      @comments = @account.comments.where(id: params[:id])
      authorize @comments.first, :show?
      @form = Form::CommentBatch.new
    end

    def create
      authorize :comment, :update?

      @form = Form::CommentBatch.new(form_comment_batch_params.merge(current_account: current_account, action: action_from_button))
      flash[:alert] = I18n.t('admin.statuses.failed_to_execute') unless @form.save

      redirect_to admin_comments_path(current_params)
    rescue ActionController::ParameterMissing
      flash[:alert] = I18n.t('admin.statuses.no_comment_selected')

      redirect_to admin_comments_path(current_params)
    end

    private

    def form_comment_batch_params
      params.require(:form_comment_batch).permit(:action, comment_ids: [])
    end

    def filtered_comments
      CommentFilter.new(nil, nil, nil, filter_params).results
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
        :id,
        :account_id,
        :source,
        :source_id,
        :created_at_lte,
        :created_at_gte
      )
    end

    def action_from_button
      if params[:delete]
        'delete'
      elsif params[:tombstone]
        'tombstone'
      end
    end

  end
end
