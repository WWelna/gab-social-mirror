class AddUnreadCountToAccountStats < ActiveRecord::Migration[5.2]
    def up
      add_column :account_stats, :unread_count, :integer, default: 0
    end
    
    def down
      remove_column :account_stats, :unread_count
    end
end