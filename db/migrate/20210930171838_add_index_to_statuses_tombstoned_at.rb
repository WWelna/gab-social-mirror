class AddIndexToStatusesTombstonedAt < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!

  def change
    add_index :statuses, :tombstoned_at, algorithm: :concurrently
  end
end
