class AddThemeColorToGroups < ActiveRecord::Migration[6.0]
  def up
    safety_assured { add_column :groups, :theme_color, :text, default: nil, null: true }
  end

  def down
    remove_column :groups, :theme_color
  end
end
