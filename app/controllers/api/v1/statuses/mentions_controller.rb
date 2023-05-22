# frozen_string_literal: true

class Api::V1::Statuses::MentionsController < Api::BaseController
  before_action :require_user!

  def destroy
    @status = requested_status
    mention = @status.active_mentions.where(account_id: current_account.id).first!
    mention.update!(silent: true)
    render json: @status, serializer: REST::StatusMentionedSerializer
  end

  private
  
  def requested_status
    Status.find(params[:status_id])
  end
end