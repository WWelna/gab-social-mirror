class CreateGroupAccountBadges < ActiveRecord::Migration[6.0]
  def change
    create_table :group_account_badges do |t|
      t.belongs_to :group
      t.string :name
      t.string :color
      t.string :icon
      t.string :description
    end
  end
end
