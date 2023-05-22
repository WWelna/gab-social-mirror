class AddTombstonedAtToStatuses < ActiveRecord::Migration[6.0]
  def up
    safety_assured { add_column :statuses, :tombstoned_at, :datetime}
  end

  def down
    remove_column :statuses, :datetime
  end
end
