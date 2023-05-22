class AddIsFeaturedToLists < ActiveRecord::Migration[6.0]
  def change
    add_column :lists, :is_featured, :boolean
  end
end
