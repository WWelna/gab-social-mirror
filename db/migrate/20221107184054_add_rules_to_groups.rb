class AddRulesToGroups < ActiveRecord::Migration[6.0]
  def up
    safety_assured { add_column :groups, :rules, :json, default: nil, null: true }
  end

  def down
    remove_column :groups, :rules
  end
end
