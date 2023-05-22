class CreateRemoteRssFeeds < ActiveRecord::Migration[6.0]
    def change
      create_table :remote_rss_feeds do |t|
        t.string :url
        t.boolean :active, default: false, null: false
        t.datetime :last_scan_at
        t.datetime :last_trigger_at
        t.integer :fail_count, default: 0, null: false
        t.string :top_guid
        t.timestamps
      end
    end
  end
  