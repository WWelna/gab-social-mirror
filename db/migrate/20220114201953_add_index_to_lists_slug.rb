class AddIndexToListsSlug < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!
  
  def change
    add_index :lists, :slug, unique: true, algorithm: :concurrently
  end
end
