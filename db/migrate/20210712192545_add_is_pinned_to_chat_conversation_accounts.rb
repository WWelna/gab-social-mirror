class AddIsPinnedToChatConversationAccounts < ActiveRecord::Migration[6.0]
  def up
    safety_assured { add_column :chat_conversation_accounts, :is_pinned, :bool, default: false, null: false }
  end

  def down
    remove_column :chat_conversation_accounts, :is_pinned
  end
end
