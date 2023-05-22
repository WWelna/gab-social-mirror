class AddDirectRepliesCountToStatusStats < ActiveRecord::Migration[6.0]

  def change
    add_column :status_stats, :direct_replies_count, :integer, null: true, default: nil
  end
  
end
  