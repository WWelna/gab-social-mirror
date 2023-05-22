class AddSlugToLists < ActiveRecord::Migration[6.0]
  def change
    add_column :lists, :slug, :string
  end
end
