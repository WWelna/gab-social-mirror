class ChangeMarketplaceListingPriceToDecimal < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!
  
  def change
    safety_assured do
      change_column :marketplace_listings, :price, :decimal
    end
  end
end
