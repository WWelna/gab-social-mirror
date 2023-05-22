class AddSubscriberCountToLists < ActiveRecord::Migration[6.0]
  def change
    add_column :lists, :subscriber_count, :integer, null: false, default: 0
  end
end
