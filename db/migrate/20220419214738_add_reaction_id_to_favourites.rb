class AddReactionIdToFavourites < ActiveRecord::Migration[6.0]
  def change
    add_column :favourites, :reaction_id, :bigint
  end
end
