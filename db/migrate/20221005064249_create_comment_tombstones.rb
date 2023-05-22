class CreateCommentTombstones < ActiveRecord::Migration[6.0]
  def change
    create_table :comment_tombstones do |t|
      t.belongs_to :comment, foreign_key: { on_delete: :cascade }
      t.timestamps null: false
    end
  end
end