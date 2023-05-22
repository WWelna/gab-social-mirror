class CreateCommentStats < ActiveRecord::Migration[6.0]
  def change
    create_table :comment_stats do |t|
      t.timestamps
      t.belongs_to :comment, null: false, foreign_key: { on_delete: :cascade }, index: { unique: true }
      t.bigint :replies_count, null: false, default: 0
      t.bigint :reactions_count, null: false, default: 0
    end
  end
end
