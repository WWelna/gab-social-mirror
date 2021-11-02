class CreateUnfollows < ActiveRecord::Migration[6.0]
  def change
    create_table :unfollows do |t|
      t.belongs_to :account, foreign_key: { on_delete: :cascade }
      t.belongs_to :target_account, foreign_key: { on_delete: :cascade, to_table: :accounts }

      t.timestamps null: false
    end
  end
end
