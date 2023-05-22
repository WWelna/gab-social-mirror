class CreateStatusLinks < ActiveRecord::Migration[6.0]
  def change
    create_table :status_links do |t|
      t.string :url
      t.references :status, null: false, foreign_key: true
      t.timestamps
    end
  end
end
