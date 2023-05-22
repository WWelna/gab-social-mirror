# frozen_string_literal: true

class Api::V1::Comments::MentionsController < Api::BaseController
  before_action :require_user!

  def destroy
    @comment = requested_comment
    mention = @comment.active_comment_mentions.where(account_id: current_account.id).first!
    mention.update!(silent: true)
    render json: @comment, serializer: REST::CommentMentionedSerializer
  end

  private
  
  def requested_comment
    Comment.find(params[:comment_id])
  end
end