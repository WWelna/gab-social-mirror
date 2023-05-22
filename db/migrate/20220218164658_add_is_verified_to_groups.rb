class AddIsVerifiedToGroups < ActiveRecord::Migration[6.0]
  def up
    safety_assured { add_column :groups, :is_verified, :bool, default: false, null: false }
  end

  def down
    remove_column :groups, :is_verified
  end
end
