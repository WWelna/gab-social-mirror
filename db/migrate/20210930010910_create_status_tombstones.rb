class CreateStatusTombstones < ActiveRecord::Migration[6.0]
  def change
    create_table :status_tombstones do |t|
      t.belongs_to :status, foreign_key: { on_delete: :cascade }
      t.timestamps null: false
    end
  end
end
