class AddIsMembersVisibleToGroups < ActiveRecord::Migration[6.0]
  def up
    safety_assured { add_column :groups, :is_members_visible, :bool, default: nil, null: true }
  end

  def down
    remove_column :groups, :is_members_visible
  end
end
