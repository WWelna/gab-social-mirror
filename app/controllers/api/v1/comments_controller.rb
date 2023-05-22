# frozen_string_literal: true

class Api::V1::CommentsController < Api::BaseController
  include Authorization

  before_action :require_user!, except: [:show]
  before_action :set_comment, only:     [:show, :update, :revisions]

  def show
    render json: @comment, serializer: REST::CommentSerializer, comment_relationships: CommentRelationshipsPresenter.new([@comment], current_user&.account_id)
  end

  def revisions
    @revisions = @comment.comment_revisions

    render json: @revisions, each_serializer: REST::CommentRevisionSerializer
  end

  def create
    log_request(:info)
    @comment = PostCommentService.new.call(current_user.account,
                                         text: comment_params[:text],
                                         source: comment_params[:source],
                                         source_id: comment_params[:source_id],
                                         thread: comment_params[:in_reply_to_id].blank? ? nil : Comment.find(comment_params[:in_reply_to_id]),
                                        )

    render json: @comment, serializer: REST::CommentSerializer
  end

  def update
    log_request(:info)
    authorize @comment, :update?
    @comment = EditCommentService.new.call(@comment, text: comment_params[:text])

    render json: @comment, serializer: REST::CommentSerializer
  end

  def destroy
    @comment = Comment.where(account_id: current_user.account).find(params[:id])
    authorize @comment, :destroy?
    DeleteCommentWorker.perform_async(@comment.id)
  end

  private

  def set_comment
    @comment = Comment.find(params[:id])
    authorize @comment, :show?
  rescue GabSocial::NotPermittedError
    raise ActiveRecord::RecordNotFound
  end

  def comment_params
    params.permit(
      :source,
      :source_id,
      :text,
    )
  end
end
