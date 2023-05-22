class CreateCommentMentions < ActiveRecord::Migration[6.0]
  def change
    create_table :comment_mentions do |t|
      t.bigint :account_id
      t.bigint :comment_id
      t.boolean :silent, nil: false, default: false
      t.timestamps null: false
    end

    add_index :comment_mentions, [:account_id, :comment_id], unique: true
  end
end
