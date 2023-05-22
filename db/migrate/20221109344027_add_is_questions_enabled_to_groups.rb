class AddIsQuestionsEnabledToGroups < ActiveRecord::Migration[6.0]
  def up
    safety_assured { add_column :groups, :is_questions_enabled, :bool, default: nil, null: true }
  end

  def down
    remove_column :groups, :is_questions_enabled
  end
end
