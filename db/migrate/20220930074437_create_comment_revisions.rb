class CreateCommentRevisions < ActiveRecord::Migration[6.0]
  def change
    create_table :comment_revisions do |t|
      t.timestamps
      t.bigint :comment_id
      t.string :text
    end
  end
end
