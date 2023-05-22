class AddIsShippingRequiredToMarketplaceListings < ActiveRecord::Migration[6.0]
  def change
    add_column :marketplace_listings, :is_shipping_required, :boolean
  end
end
