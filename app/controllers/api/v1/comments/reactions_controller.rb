# frozen_string_literal: true

class Api::V1::Comments::ReactionsController < Api::BaseController
  include Authorization

  before_action :require_user!

  def create
    @comment = reacted_comment
    render json: @comment, serializer: REST::CommentStatSerializer
  end

  def destroy
    @comment = requested_comment
    @reactions_map = { @comment.id => false }

    CommentUnreactWorker.new.perform(current_user.account_id, @comment.id)

    render json: @comment,
           serializer: REST::CommentStatSerializer,
           unreact: true,
           comment_relationships: CommentRelationshipsPresenter.new([@comment], current_user&.account_id, reactions_map: @reactions_map)
  end

  private

  def reacted_comment
    service_result.comment.reload
  end

  def service_result
    CommentReactService.new.call(current_user.account, requested_comment, params[:reaction_id])
  end

  def requested_comment
    Comment.find(params[:comment_id])
  end
end
