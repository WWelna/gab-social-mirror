class AddIsParodyToAccounts < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!
  
  def up 
    safety_assured { add_column :accounts, :is_parody, :bool, default: nil, null: true }
  end

  def down
    remove_column :accounts, :is_parody
  end
end
