class CreateBlockedGroups < ActiveRecord::Migration[5.0]
  def change
    create_table :blocked_groups do |t|
    t.integer :account_id, null: false
    t.integer :target_group_id, null: false

    t.timestamps null: false
    end

    add_index :blocked_groups, [:account_id, :target_group_id], unique: true
  end
end
  