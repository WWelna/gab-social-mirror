class AddVisibilityToLists < ActiveRecord::Migration[6.0]
  def change
    add_column :lists, :visibility, :integer, null: false, default: 0
  end
end
