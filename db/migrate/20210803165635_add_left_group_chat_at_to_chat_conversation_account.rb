class AddLeftGroupChatAtToChatConversationAccount < ActiveRecord::Migration[6.0]
  def change
    add_column :chat_conversation_accounts, :left_group_chat_at, :datetime
  end
end
