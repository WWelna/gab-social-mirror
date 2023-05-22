class BackfillAddSubscriberCountToLists < ActiveRecord::Migration[6.0]
  def change
    List.in_batches do |relation|
      relation.update_all subscriber_count: 0
      sleep(0.1)
    end
  end
end