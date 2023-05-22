class BackfillAddVisibilityToLists < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!

  def change
    List.in_batches do |relation|
      relation.update_all visibility: 0
      sleep(0.1)
    end
  end
end
