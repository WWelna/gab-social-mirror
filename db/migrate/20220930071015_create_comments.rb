class CreateComments < ActiveRecord::Migration[6.0]
  def change
    create_table :comments do |t|
      t.timestamps
      t.belongs_to :account, foreign_key: { on_delete: :cascade }, null: false
      t.integer :source
      t.text :source_id
      t.text :language, null: false, default: 'en'
      t.bigint :in_reply_to_id, null: true, default: nil
      t.bigint :in_reply_to_account_id, null: true, default: nil
      t.text :text, null: false, default: ''
      t.boolean :reply, nil: false, default: false
      t.bigint :comment_conversation_id, null: true, default: nil
      t.datetime :revised_at
      t.datetime :tombstoned_at
    end
  end
end
