class CreateListSubscribers < ActiveRecord::Migration[6.0]
  def change
    create_table :list_subscribers do |t|
      t.belongs_to :list, foreign_key: { on_delete: :cascade }, null: false
      t.belongs_to :account, foreign_key: { on_delete: :cascade }, null: false
      t.timestamps
    end
  end
end
