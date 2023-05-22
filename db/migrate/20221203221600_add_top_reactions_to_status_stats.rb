class AddTopReactionsToStatusStats < ActiveRecord::Migration[6.0]

    def change
      add_column :status_stats, :top_reactions, :string, null: true, default: nil
    end
    
  end
    