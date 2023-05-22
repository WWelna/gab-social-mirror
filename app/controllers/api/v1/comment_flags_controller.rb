# frozen_string_literal: true

class Api::V1::CommentFlagsController < Api::BaseController
  include Authorization

  before_action :require_user!
  before_action :set_comment, only: [:show]

  def show
    render json: @comment, serializer: REST::CommentFlagsSerializer
  end

  private

  def set_comment
    @comment = Comment.find(params[:id])
    authorize @comment, :show?
  rescue GabSocial::NotPermittedError
    raise ActiveRecord::RecordNotFound
  end

end