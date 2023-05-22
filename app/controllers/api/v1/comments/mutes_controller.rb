# frozen_string_literal: true

class Api::V1::Comments::MutesController < Api::BaseController
  include Authorization

  before_action :require_user!
  before_action :set_comment
  before_action :set_conversation

  def create
    current_account.mute_comment_conversation!(@conversation)
    @mutes_map = { @conversation.id => true }

    render json: @comment, serializer: REST::CommentSerializer
  end

  def show
    render json: @comment, serializer: REST::CommentMutedSerializer
  end

  def destroy
    current_account.unmute_comment_conversation!(@conversation)
    @mutes_map = { @conversation.id => false }

    render json: @comment, serializer: REST::CommentSerializer
  end

  private

  def set_comment
    @comment = Comment.find(params[:comment_id])
    authorize @comment, :show?
  rescue GabSocial::NotPermittedError
    not_found
  end

  def set_conversation
    @conversation = @comment.comment_conversation
    raise GabSocial::ValidationError if @conversation.nil?
  end
end