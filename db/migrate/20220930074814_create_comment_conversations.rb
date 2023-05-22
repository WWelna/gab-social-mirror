class CreateCommentConversations < ActiveRecord::Migration[6.0]
  def change
    create_table :comment_conversations do |t|
      t.timestamps null: false
    end
  end
end
