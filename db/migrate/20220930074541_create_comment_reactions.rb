class CreateCommentReactions < ActiveRecord::Migration[6.0]
  def change
    create_table :comment_reactions do |t|
      t.timestamps
      t.bigint :account_id, null: false
      t.bigint :comment_id, null: false
      t.bigint :reaction_id
    end

    add_index :comment_reactions, [:account_id, :comment_id], unique: true
  end
end
