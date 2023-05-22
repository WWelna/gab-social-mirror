class CreateGroupQuestions < ActiveRecord::Migration[6.0]
  def change
    create_table :group_questions do |t|
      t.belongs_to :group
      t.string :title
      t.string :description
      t.integer :index
      t.timestamps null: false
    end
  end
end
