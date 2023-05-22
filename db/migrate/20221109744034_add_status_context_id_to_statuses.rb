class AddStatusContextIdToStatuses < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!
  
  def change
    safety_assured {
      add_reference :statuses, :status_context, foreign_key: { on_delete: :nullify }
    }
  end
end