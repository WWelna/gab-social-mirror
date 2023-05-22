# frozen_string_literal: true

class Api::V1::CommentStatsController < Api::BaseController
  include Authorization
  
  before_action :set_comment, only: [:show]

  def show
    render json: @comment, serializer: REST::CommentStatSerializer
  end

  private

  def set_comment
    @comment = Comment.find(params[:id])
    authorize @comment, :show?
  rescue GabSocial::NotPermittedError
    raise ActiveRecord::RecordNotFound
  end

end