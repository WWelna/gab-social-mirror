# frozen_string_literal: true

class Api::V1::ChatConversationAccountsController < Api::BaseController
  before_action -> { authorize_if_got_token! :read, :'read:chats' }
  before_action -> { doorkeeper_authorize! :write, :'write:chats' }

  before_action :require_user!
  before_action :set_account, only: [
    :block_messenger,
    :unblock_messenger,
    :messenger_block_relationships
  ]
  before_action :check_account_suspension, only: [
    :block_messenger,
    :unblock_messenger,
    :messenger_block_relationships
  ]
  before_action :set_chat_conversation, except: [
    :block_messenger,
    :unblock_messenger,
    :messenger_block_relationships,
  ]

  def block_messenger
    @block = BlockChatMessengerService.new.call(current_user.account, @account)
    render json: @account,
           serializer: REST::ChatMessengerBlockedSerializer,
           chat_blocking: true
  end

  def unblock_messenger
    UnblockChatMessengerService.new.call(current_user.account, @account)
    render json: @account,
           serializer: REST::ChatMessengerBlockedSerializer,
           chat_blocking: false
  end

  # fetch if current_user is blocking @account or blocked by @account
  def messenger_block_relationships
    chat_blocking = current_user.account.chat_blocking?(@account)
    chat_blocked_by = current_user.account.chat_blocked_by?(@account, current_account)
    render json: @account,
           serializer: REST::ChatMessengerBlockedSerializer,
           chat_blocking: chat_blocking,
           chat_blocked_by: chat_blocked_by
  end

  def mute_chat_conversation
    @chat_conversation_account.update!(is_muted: true)
    render json: @chat_conversation_account, serializer: REST::ChatConversationAccountSerializer
  end

  def unmute_chat_conversation
    @chat_conversation_account.update!(is_muted: false)
    render json: @chat_conversation_account, serializer: REST::ChatConversationAccountSerializer
  end

  def pin_chat_conversation
    @chat_conversation_account.update!(is_pinned: true)
    render json: @chat_conversation_account, serializer: REST::ChatConversationAccountSerializer
  end

  def unpin_chat_conversation
    @chat_conversation_account.update!(is_pinned: false)
    render json: @chat_conversation_account, serializer: REST::ChatConversationAccountSerializer
  end

  def leave_group_chat_conversation
    if !@chat_conversation_account.is_group_chat?
      raise GabSocial::NotPermittedError, "You cannot leave this chat. To stop receiving messages from this sender, you can hide and block them."
    end

    @chat_conversation_account.update!(
      left_group_chat_at: Time.now.utc,
      is_hidden: true
    )
    render json: @chat_conversation_account, serializer: REST::ChatConversationAccountSerializer
  end

  private

  def set_account
    # using params[:id] for this too, yea...
    @account = Account.find(params[:id])
  end

  # find MY chat conversation account
  def set_chat_conversation
    @chat_conversation_account = ChatConversationAccount.where(
      account: current_account,
      chat_conversation: params[:id]
    ).first
  end

  def check_account_suspension
    gone if @account.suspended?
  end

  def relationships(**options)
    AccountRelationshipsPresenter.new([@account.id], current_user.account_id, options)
  end

end
