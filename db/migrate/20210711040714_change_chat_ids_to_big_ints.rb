class ChangeChatIdsToBigInts < ActiveRecord::Migration[6.0]
  def change
    safety_assured do
      change_column :chat_messages, :chat_conversation_id, :bigint
      change_column :chat_conversation_accounts, :chat_conversation_id, :bigint
    end
  end
end
