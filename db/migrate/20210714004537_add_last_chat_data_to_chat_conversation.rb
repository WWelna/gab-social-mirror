class AddLastChatDataToChatConversation < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!

  def change
    add_column :chat_conversations, :last_chat_message_id, :bigint, index: true
    add_foreign_key :chat_conversations, :chat_messages, column: :last_chat_message_id
    add_column :chat_conversations, :last_chat_message_sent_at, :datetime
  end
end
