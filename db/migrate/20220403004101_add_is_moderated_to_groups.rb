class AddIsModeratedToGroups < ActiveRecord::Migration[6.0]
    def up
        safety_assured { add_column :groups, :is_moderated, :bool, default: nil, null: true }
    end

    def down
        remove_column :groups, :is_moderated
    end
end
  