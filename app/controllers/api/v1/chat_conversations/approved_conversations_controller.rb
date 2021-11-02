# frozen_string_literal: true

class Api::V1::ChatConversations::ApprovedConversationsController < Api::BaseController
  before_action -> { authorize_if_got_token! :read, :'read:chats' }

  before_action :require_user!
  after_action :insert_pagination_headers

  def index
    chat_conversation_accounts = load_chat_conversation_accounts
    render json: chat_conversation_accounts, each_serializer: REST::ChatConversationAccountSerializer
  end

  def show
    render json: @chat_conversation_account, serializer: REST::ChatConversationAccountSerializer
  end

  def unread_count
    # find conversations where user has approved and not hidden them
    sum_of_unreads = current_account
      .chat_conversation_accounts
      .active
      .where('unread_count > 0')
      .sum('unread_count')

    # just count convo, not all unreads msgs
    sum_of_unread_chat_requests = current_account
      .chat_conversation_accounts
      .requests
      .where('unread_count > 0')
      .count
    
    total = sum_of_unreads.to_i + sum_of_unread_chat_requests.to_i

    render json: total
  end

  def reset_all_unread_count
    # reset all, approved and unapproved
    current_account
      .chat_conversation_accounts
      .where('unread_count > 0')
      .update_all(unread_count: 0)
  end

  private

  def load_chat_conversation_accounts
    paginated_chat_conversation_accounts
  end

  def paginated_chat_conversation_accounts
    current_account
      .chat_conversation_accounts
      .active
      .by_recent_message
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
      api_v1_chat_conversations_approved_conversations_url pagination_params(max_id: pagination_max_id)
    end
  end

  def prev_path
    unless paginated_chat_conversation_accounts.empty?
      api_v1_chat_conversations_approved_conversations_url pagination_params(since_id: pagination_since_id)
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
