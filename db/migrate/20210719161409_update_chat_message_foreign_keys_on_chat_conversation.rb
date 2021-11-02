class UpdateChatMessageForeignKeysOnChatConversation < ActiveRecord::Migration[6.0]
  def change
    safety_assured do
      remove_foreign_key :chat_conversations, :chat_messages, column: :last_chat_message_id
      add_foreign_key :chat_conversations, :chat_messages, column: :last_chat_message_id, on_delete: :nullify
    end
  end
end
