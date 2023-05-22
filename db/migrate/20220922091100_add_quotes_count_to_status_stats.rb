class AddQuotesCountToStatusStats < ActiveRecord::Migration[6.0]

  def change
    add_column :status_stats, :quotes_count, :integer, null: true, default: nil
  end
  
end
  