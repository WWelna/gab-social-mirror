# frozen_string_literal: true

class Api::V1::ChatMessagesController < Api::BaseController
  before_action -> { authorize_if_got_token! :read, :'read:chats' }
  before_action -> { doorkeeper_authorize! :write, :'write:chats' }

  before_action :require_user!
  before_action :set_chat_message, only: :destroy

  def create
    chat_conversation_account = current_account.chat_conversation_accounts.find_by!(
      chat_conversation: chat_params[:chat_conversation_id]
    )

    marketplace_listing = nil
    if !params[:marketplace_listing_id].nil?
      marketplace_listing = MarketplaceListing.only_running.find(params[:marketplace_listing_id])
    end

    chat = PostChatMessageService.new.call(
      current_account,
      text: chat_params[:text],
      media_ids: chat_params[:media_ids],
      chat_conversation_account: chat_conversation_account,
      marketplace_listing: marketplace_listing
    )

    render json: chat, serializer: REST::ChatMessageSerializer
  end

  def destroy
    DeleteChatMessageService.new.call(@chat_message)
    render json: @chat_message, serializer: REST::ChatMessageSerializer
  end

  private

  def chat_params
    params.permit(:text, :chat_conversation_id, :marketplace_listing, media_ids: [])
  end

  def set_chat_message
    @chat_message = current_account.chat_messages.find(params[:id])
  end

end
