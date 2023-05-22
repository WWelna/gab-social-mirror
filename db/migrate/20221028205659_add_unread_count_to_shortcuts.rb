class AddUnreadCountToShortcuts < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!
  
  def up 
    safety_assured { add_column :shortcuts, :unread_count, :smallint, default: 0, null: false }
  end

  def down
    remove_column :shortcuts, :unread_count
  end
end
