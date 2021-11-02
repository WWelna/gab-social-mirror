class CreateUnfavourites < ActiveRecord::Migration[6.0]
  def change
    create_table :unfavourites do |t|
      t.belongs_to :account, foreign_key: { on_delete: :cascade }
      t.belongs_to :status, foreign_key: { on_delete: :cascade }

      t.timestamps null: false
    end
  end
end