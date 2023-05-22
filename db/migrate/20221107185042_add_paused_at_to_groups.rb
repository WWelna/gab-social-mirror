class AddPausedAtToGroups < ActiveRecord::Migration[6.0]
  def up
    safety_assured { add_column :groups, :paused_at, :datetime, default: nil, null: true }
  end

  def down
    remove_column :groups, :paused_at
  end
end
