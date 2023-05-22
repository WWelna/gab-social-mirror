class AddIsApprovedToGroupAccounts < ActiveRecord::Migration[6.0]
    def up
        safety_assured { add_column :group_accounts, :is_approved, :bool, default: nil, null: true }
    end

    def down
        remove_column :group_accounts, :is_approved
    end
end
  