# frozen_string_literal: true

class PurgeChatMessagesService < BaseService
  def call(account, chat_conversation_account)
    unless account.is_pro
      raise GabSocial::NotPermittedError, 'You must be pro to purge chat messages'
    end

    # Destroy all mine
    ChatMessage.where(
      from_account: account,
      chat_conversation: chat_conversation_account.chat_conversation
    ).in_batches.destroy_all

    # find last chat message (if any)
    last_chat_in_conversation = ChatMessage.where(
      chat_conversation: chat_conversation_account.chat_conversation
    ).first

    if last_chat_in_conversation.nil?
      # dont update sent_at now because it will send this to bottom of "most recent" list
      chat_conversation_account.chat_conversation.update!(last_chat_message_id: nil)
    else
      # set all unread counts to 0 if last chat was mine
      if last_chat_in_conversation.from_account_id == account.id
        ChatConversationAccount.where(
          chat_conversation: chat_conversation_account.chat_conversation
        ).update_all(
          unread_count: 0
        )
      end

      # dont update sent_at now
      chat_conversation_account.chat_conversation.update!(
        last_chat_message_id: last_chat_in_conversation.id,
      )
    end

  end
end
