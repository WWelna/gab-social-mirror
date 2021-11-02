class RemoveLastChatMessageIdFromChatConversationAccount < ActiveRecord::Migration[6.0]
  def change
    safety_assured { remove_column :chat_conversation_accounts, :last_chat_message_id }
  end
end
