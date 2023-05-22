class CreateMarketplaceListingChatConversations < ActiveRecord::Migration[6.0]
  def change
    create_table :marketplace_listing_chat_conversations do |t|
      t.bigint :marketplace_listing_id, null: false
      t.bigint :chat_conversation_id, null: false
      t.bigint :chat_message_id
    end

    safety_assured { add_index :marketplace_listing_chat_conversations, [:chat_conversation_id, :marketplace_listing_id], unique: true, name: 'index_mp_listing_chat_conversations_on_mp_id' }
  end
end
