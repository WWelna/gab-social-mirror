class CreateStatusContexts < ActiveRecord::Migration[6.0]
  def change
    create_table :status_contexts do |t|
      t.bigint :owner_id, null: false
      t.integer :owner_type, null: false
      t.string :name
      t.boolean :is_global, null: false, default: false
      t.boolean :is_enabled, null: false, default: false
      t.integer :index
      t.timestamps null: false
    end
  end
end
