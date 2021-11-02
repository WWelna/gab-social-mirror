class RemoveTextOnChatMessage < ActiveRecord::Migration[6.0]
  def change
    safety_assured { remove_column :chat_messages, :text }
  end
end
