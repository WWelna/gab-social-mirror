# frozen_string_literal: true

class Api::V1::ChatConversations::RequestedConversationsController < Api::BaseController
  before_action -> { authorize_if_got_token! :read, :'read:chats' }

  before_action :require_user!
  after_action :insert_pagination_headers, only: :index

  def index
    @chat_conversation_accounts = load_chat_conversation_accounts
    render json: @chat_conversation_accounts, each_serializer: REST::ChatConversationAccountSerializer
  end

  def count
    count = current_account
      .chat_conversation_accounts
      .requests
      .with_last_message
      .count
    render json: count
  end

  private

  def load_chat_conversation_accounts
    paginated_chat_conversation_accounts
  end

  def paginated_chat_conversation_accounts
    current_account
      .chat_conversation_accounts
      .requests
      .with_last_message
      .paginate_by_max_id(
        limit_param(DEFAULT_CHAT_CONVERSATION_LIMIT),
        params[:max_id],
        params[:since_id]
      )
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    if records_continue?
      api_v1_chat_conversations_requested_conversations_url pagination_params(max_id: pagination_max_id)
    end
  end

  def prev_path
    unless paginated_chat_conversation_accounts.empty?
      api_v1_chat_conversations_requested_conversations_url pagination_params(since_id: pagination_since_id)
    end
  end

  def pagination_max_id
    paginated_chat_conversation_accounts.last.id
  end

  def pagination_since_id
    paginated_chat_conversation_accounts.first.id
  end

  def records_continue?
    paginated_chat_conversation_accounts.size == limit_param(DEFAULT_CHAT_CONVERSATION_LIMIT)
  end

  def pagination_params(core_params)
    params.slice(:limit).permit(:limit).merge(core_params)
  end

end
