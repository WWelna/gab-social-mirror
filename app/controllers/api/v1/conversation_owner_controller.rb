# frozen_string_literal: true

class Api::V1::ConversationOwnerController < Api::BaseController
  before_action :require_user!

  def show
    obj = Status.unscoped.where(conversation_id: params[:conversation_id]).order(id: :asc).limit(1).pluck(:account_id, :id, :in_reply_to_account_id).first
    
    if obj.nil?
      return render json: { error: 'Invalid conversation id' }, status: 500
    end

    owner = obj[2].nil? ? obj[0] : obj[2]

    render json: {
      account_id: owner.to_s,
      coversation_owner_status_id: obj[1].to_s,
    }
  end

end
