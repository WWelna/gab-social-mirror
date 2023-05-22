class AddUserDismissedAtToAccountWarnings < ActiveRecord::Migration[6.0]
  def up
    safety_assured { add_column :account_warnings, :user_dismissed_at, :datetime}
  end

  def down
    remove_column :account_warnings, :user_dismissed_at
  end
end
