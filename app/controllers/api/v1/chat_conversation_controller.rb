# frozen_string_literal: true

class Api::V1::ChatConversationController < Api::BaseController
  before_action -> { authorize_if_got_token! :read, :'read:chats' }
  before_action -> { doorkeeper_authorize! :write, :'write:chats' }

  before_action :require_user!
  before_action :set_accounts, only: :create
  before_action :set_chat_conversation_account, only: [
      :show,
      :mark_chat_conversation_approved,
      :mark_chat_conversation_hidden,
      :mark_chat_conversation_read,
      :set_expiration_policy
    ]

  def show
    # make sure current_account OWNS this chat conversation
    my_chat_conversation = current_account
      .chat_conversation_accounts
      .where(chat_conversation: params[:id])
      .first!
    render json: my_chat_conversation, serializer: REST::ChatConversationAccountSerializer
  end

  def create
    chat_conversation_account = find_or_create_conversation
    render json: chat_conversation_account, serializer: REST::ChatConversationAccountSerializer
  end

  def mark_chat_conversation_read
    @chat_conversation_account.update!(unread_count: 0)
    render json: @chat_conversation_account, serializer: REST::ChatConversationAccountSerializer
  end

  def mark_chat_conversation_hidden
    @chat_conversation_account.update!(is_hidden: true)
    render json: @chat_conversation_account, serializer: REST::ChatConversationAccountSerializer
  end

  def mark_chat_conversation_approved
    @chat_conversation_account.update!(is_approved: true)
    render json: @chat_conversation_account, serializer: REST::ChatConversationAccountSerializer
  end

  def set_expiration_policy
    if !current_user.account.is_pro
      return render json: { error: 'You need to be a GabPRO member to set chat conversation expiration' }, status: 422
    end

    expiration = ChatConversationAccount.expiration_policy_db(name: params[:expiration])

    @chat_conversation_account.update!(chat_message_expiration_policy: expiration)
    render json: @chat_conversation_account, serializer: REST::ChatConversationAccountSerializer
  end

  private

  def find_or_create_conversation
    return CreateChatConversationService.new.call(current_account, @accounts)
  end

  def set_accounts
    if !params[:account_id]
      raise GabSocial::NotPermittedError, "Unable to create conversation."
    end

    if params[:account_id].is_a?(String)
      @accounts = Account.where(id: params[:account_id])
    elsif params[:account_id].is_a?(Array)
      # just get first if not PRO
      if current_account.is_pro?
        @accounts = Account.where(id: params[:account_id]).limit(DEFAULT_GROUP_CHAT_CONVERSATION_PARTICIPANT_LIMIT)
      else
        @accounts = Account.where(id: params[:account_id].first)
      end
    else
      raise GabSocial::NotPermittedError, "Unable to create conversation."
    end
  end

  def set_chat_conversation_account
    @chat_conversation_account = ChatConversationAccount.where(
      account: current_account,
      chat_conversation: params[:id]
    ).first
  end

end
