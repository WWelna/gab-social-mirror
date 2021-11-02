# frozen_string_literal: true

class Api::V1::ChatConversations::SearchConversationsController < Api::BaseController
  before_action :require_user!

  def index
    query = params[:q]&.strip

    participant_account_ids = current_account
      .chat_conversation_accounts
      .active
      .map(&:participant_account_ids)
      .flatten

    account_ids = Account.
      matches_display_name(query).where(id: participant_account_ids).
      or(Account.matches_username(query).where(id: participant_account_ids)).
      map(&:id)

    values = current_account
      .chat_conversation_accounts
      .where("participant_account_ids && ?", account_ids.to_s.gsub("[", "{").gsub("]", "}"))
    
    render json: values, each_serializer: REST::ChatConversationAccountSerializer
  end

end
