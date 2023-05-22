class CreateCommentConversationMutes < ActiveRecord::Migration[6.0]
  def change
    create_table :comment_conversation_mutes do |t|
      t.integer :account_id, null: false
      t.bigint :comment_conversation_id, null: false
    end

    add_index :comment_conversation_mutes, [:account_id, :comment_conversation_id], unique: true, name: 'comment_convo_mutes_on_account_and_comment_convo'
  end
end
