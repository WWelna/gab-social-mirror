class CreateMarketplaceListingStatusChanges < ActiveRecord::Migration[6.0]
  def change
    create_table :marketplace_listing_status_changes do |t|
      t.timestamps
      t.belongs_to :marketplace_listing, foreign_key: { on_delete: :cascade }, null: false, index: {:name => "index_mp_listing_status_changes_on_mp_listing_id"}
      t.integer :old_status, default: 0, null: false
      t.integer :new_status, default: 0, null: false
      t.string :note
      t.integer :reviewer_account_id, null: false
    end

    safety_assured { add_foreign_key :marketplace_listing_status_changes, :accounts, column: :reviewer_account_id }
  end
end
