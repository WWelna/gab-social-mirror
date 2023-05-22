class CreateGroupModerationStatuses < ActiveRecord::Migration[6.0]
  def change
    create_table :group_moderation_statuses do |t|
      t.belongs_to :account, foreign_key: { on_delete: :cascade }
      t.belongs_to :group, foreign_key: { on_delete: :cascade }
      t.integer :spam_score
      t.jsonb :content
      t.timestamps
    end
  end
end
