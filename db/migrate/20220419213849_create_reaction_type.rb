class CreateReactionType < ActiveRecord::Migration[6.0]
  def change
    create_table :reaction_types do |t|
      t.string :name, null: false
      t.string :name_past, null: false
      t.string :name_plural, null: false
      t.string :slug , null: false
      t.attachment :image
      t.integer :index
      t.decimal :rating, precision: 5, scale: 2
      t.datetime :active_start_date
      t.datetime :active_end_date
      t.timestamps
    end
  end
end
