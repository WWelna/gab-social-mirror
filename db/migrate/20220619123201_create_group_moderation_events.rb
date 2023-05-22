class CreateGroupModerationEvents < ActiveRecord::Migration[6.0]
    def change
      create_table :group_moderation_events do |t|
        t.belongs_to :account
        t.belongs_to :group
        t.belongs_to :status, optional: true
        t.belongs_to :group_moderation_status, optional: true
        t.boolean :approved, default: false
        t.boolean :rejected, default: false
        t.boolean :removed, default: false
        t.boolean :reported, default: false
        t.datetime :acted_at
        t.timestamps
      end
    end
  end
  