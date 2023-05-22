class CreateMarketplaceListingRuntimes < ActiveRecord::Migration[6.0]
  def change
    create_table :marketplace_listing_runtimes do |t|
      t.timestamps
      t.bigint :seconds, null: false, default: 0
      t.belongs_to :marketplace_listing, foreign_key: { on_delete: :cascade }, null: false
    end

    safety_assured { add_index :marketplace_listing_runtimes, [:marketplace_listing_id], unique: true, name: 'index_mp_listing_runtime_on_mp_listing_id' }
  end
end
