class CreateJoinTablePreviewCardsChatMessages < ActiveRecord::Migration[6.0]
  def change
    create_join_table :preview_cards, :chat_messages do |t|
      t.index [:chat_message_id, :preview_card_id], name: 'index_chat_message_preview_cards_on_cm_id_and_pc_id'
    end
  end
end
