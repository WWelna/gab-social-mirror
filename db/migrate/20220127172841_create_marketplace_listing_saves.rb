class CreateMarketplaceListingSaves < ActiveRecord::Migration[6.0]
  def change
    create_table :marketplace_listing_saves do |t|
      t.timestamps
      t.belongs_to :account, foreign_key: { on_delete: :cascade }, null: false
      t.belongs_to :marketplace_listing, foreign_key: { on_delete: :cascade }, null: false
    end

    safety_assured { add_index :marketplace_listing_saves, [:account_id, :marketplace_listing_id], unique: true, name: 'index_mp_listing_saves_on_account_id_and_mp_listing_id' }
  end
end
