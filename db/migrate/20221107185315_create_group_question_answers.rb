class CreateGroupQuestionAnswers < ActiveRecord::Migration[6.0]
  def change
    create_table :group_question_answers do |t|
      t.belongs_to :group
      t.belongs_to :account
      t.integer :group_question_id, null: false
      t.string :answer, null: false
      t.timestamps null: false
    end
  end
end
