class AddUniqueIndexToReactionTypes < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!

  def change
    add_index :reaction_types, :slug, unique: true, algorithm: :concurrently
  end
end
