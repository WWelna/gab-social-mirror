class ChangeMarketplaceListingEnumsToSmallInts < ActiveRecord::Migration[6.0]
  def change
    safety_assured do
      change_column :marketplace_listings, :status, :smallint
      change_column :marketplace_listings, :condition, :smallint
    end
  end
end
