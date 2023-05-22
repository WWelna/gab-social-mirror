class AddBadgeIdToGroupAccounts < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!

  def change
    safety_assured {
      add_reference :group_accounts, :group_account_badge, foreign_key: { on_delete: :nullify }
    }
  end

end
