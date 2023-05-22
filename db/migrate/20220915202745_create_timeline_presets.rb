class CreateTimelinePresets < ActiveRecord::Migration[6.0]
  def change
    create_table :timeline_presets do |t|
      t.timestamps
      t.belongs_to :account, foreign_key: { on_delete: :cascade }, null: false
      t.string :timeline, null: false
      t.string :timeline_id
      t.string :sort
      t.integer :index
      t.string :filters, array: true
      t.string :name, null: false, default: ''
    end
  end
end
