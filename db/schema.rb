# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2022_01_14_201953) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "ltree"
  enable_extension "pg_buffercache"
  enable_extension "pg_stat_statements"
  enable_extension "pg_trgm"
  enable_extension "pgstattuple"
  enable_extension "plpgsql"

  create_table "account_conversations", force: :cascade do |t|
    t.bigint "account_id"
    t.bigint "conversation_id"
    t.bigint "participant_account_ids", default: [], null: false, array: true
    t.bigint "status_ids", default: [], null: false, array: true
    t.bigint "last_status_id"
    t.integer "lock_version", default: 0, null: false
    t.boolean "unread", default: false, null: false
    t.index ["account_id", "conversation_id", "participant_account_ids"], name: "index_unique_conversations", unique: true
    t.index ["conversation_id"], name: "index_account_conversations_on_conversation_id"
  end

  create_table "account_moderation_notes", force: :cascade do |t|
    t.text "content", null: false
    t.bigint "account_id", null: false
    t.bigint "target_account_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_account_moderation_notes_on_account_id"
    t.index ["target_account_id"], name: "index_account_moderation_notes_on_target_account_id"
  end

  create_table "account_stats", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "statuses_count", default: 0, null: false
    t.bigint "following_count", default: 0, null: false
    t.bigint "followers_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "last_status_at"
    t.index ["account_id"], name: "index_account_stats_on_account_id", unique: true
  end

  create_table "account_tag_stats", force: :cascade do |t|
    t.bigint "tag_id", null: false
    t.bigint "accounts_count", default: 0, null: false
    t.boolean "hidden", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tag_id"], name: "index_account_tag_stats_on_tag_id", unique: true
  end

  create_table "account_username_changes", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.text "from_username", default: "", null: false
    t.text "to_username", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_account_username_changes_on_account_id"
  end

  create_table "account_verification_requests", force: :cascade do |t|
    t.bigint "account_id"
    t.string "image_file_name"
    t.string "image_content_type"
    t.bigint "image_file_size"
    t.datetime "image_updated_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_account_verification_requests_on_account_id"
  end

  create_table "account_warning_presets", force: :cascade do |t|
    t.text "text", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "account_warnings", force: :cascade do |t|
    t.bigint "account_id"
    t.bigint "target_account_id"
    t.integer "action", default: 0, null: false
    t.text "text", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "user_dismissed_at"
    t.index ["account_id"], name: "index_account_warnings_on_account_id"
    t.index ["target_account_id"], name: "index_account_warnings_on_target_account_id"
  end

  create_table "accounts", force: :cascade do |t|
    t.string "username", default: "", null: false
    t.string "domain"
    t.string "secret", default: "", null: false
    t.string "remote_url", default: "", null: false
    t.string "salmon_url", default: "", null: false
    t.string "hub_url", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "note", default: "", null: false
    t.string "display_name", default: "", null: false
    t.string "uri", default: "", null: false
    t.string "url"
    t.string "avatar_file_name"
    t.string "avatar_content_type"
    t.integer "avatar_file_size"
    t.datetime "avatar_updated_at"
    t.string "header_file_name"
    t.string "header_content_type"
    t.integer "header_file_size"
    t.datetime "header_updated_at"
    t.string "avatar_remote_url"
    t.datetime "subscription_expires_at"
    t.boolean "locked", default: false, null: false
    t.string "header_remote_url", default: "", null: false
    t.datetime "last_webfingered_at"
    t.string "inbox_url", default: "", null: false
    t.string "outbox_url", default: "", null: false
    t.string "shared_inbox_url", default: "", null: false
    t.string "followers_url", default: "", null: false
    t.integer "protocol", default: 0, null: false
    t.boolean "memorial", default: false, null: false
    t.bigint "moved_to_account_id"
    t.string "featured_collection_url"
    t.jsonb "fields"
    t.string "actor_type"
    t.boolean "discoverable"
    t.string "also_known_as", array: true
    t.datetime "silenced_at"
    t.datetime "suspended_at"
    t.boolean "is_pro", default: false, null: false
    t.datetime "pro_expires_at"
    t.boolean "is_verified", default: false, null: false
    t.boolean "is_donor", default: false, null: false
    t.boolean "is_investor", default: false, null: false
    t.boolean "is_flagged_as_spam", default: false, null: false
    t.integer "spam_flag"
    t.tsvector "weighted_tsv"
    t.index "(((setweight(to_tsvector('simple'::regconfig, (display_name)::text), 'A'::\"char\") || setweight(to_tsvector('simple'::regconfig, (username)::text), 'B'::\"char\")) || setweight(to_tsvector('simple'::regconfig, (COALESCE(domain, ''::character varying))::text), 'C'::\"char\")))", name: "search_index", using: :gin
    t.index "lower((username)::text), lower((domain)::text)", name: "index_accounts_on_username_and_domain_lower", unique: true
    t.index ["id"], name: "index_accounts_where_is_flagged_as_spam", where: "(is_flagged_as_spam = true)"
    t.index ["id"], name: "index_accounts_where_not_flagged_as_spam", where: "(is_flagged_as_spam IS FALSE)"
    t.index ["is_flagged_as_spam", "id"], name: "index_accounts_on_is_flagged_as_spam"
    t.index ["is_pro", "is_verified", "is_donor", "is_investor"], name: "accounts_pvdi_index", where: "(((is_pro = true) OR (is_verified = true) OR (is_donor = true) OR (is_investor = true)) AND (locked IS FALSE))"
    t.index ["is_pro", "is_verified", "is_donor", "is_investor"], name: "accounts_pvdi_ul_sparse_index", where: "(((is_pro IS TRUE) OR (is_verified IS TRUE) OR (is_donor IS TRUE) OR (is_investor IS TRUE)) AND (locked IS FALSE))"
    t.index ["moved_to_account_id"], name: "index_accounts_on_moved_to_account_id"
    t.index ["username", "domain", "locked"], name: "index_accounts_on_username_and_domain__and_locked_case_sensitiv"
    t.index ["weighted_tsv"], name: "index_accounts_on_weighted_tsv", using: :gin
  end

  create_table "accounts_tags", id: false, force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "tag_id", null: false
    t.index ["account_id", "tag_id"], name: "index_accounts_tags_on_account_id_and_tag_id"
    t.index ["tag_id", "account_id"], name: "index_accounts_tags_on_tag_id_and_account_id", unique: true
  end

  create_table "admin_action_logs", force: :cascade do |t|
    t.bigint "account_id"
    t.string "action", default: "", null: false
    t.string "target_type"
    t.bigint "target_id"
    t.text "recorded_changes", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_admin_action_logs_on_account_id"
    t.index ["target_type", "target_id"], name: "index_admin_action_logs_on_target_type_and_target_id"
  end

  create_table "backups", force: :cascade do |t|
    t.bigint "user_id"
    t.string "dump_file_name"
    t.string "dump_content_type"
    t.integer "dump_file_size"
    t.datetime "dump_updated_at"
    t.boolean "processed", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "blocks", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "account_id", null: false
    t.bigint "target_account_id", null: false
    t.string "uri"
    t.index ["account_id", "target_account_id"], name: "index_blocks_on_account_id_and_target_account_id", unique: true
    t.index ["target_account_id"], name: "index_blocks_on_target_account_id"
  end

  create_table "btc_payments", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "account_id", null: false
    t.string "btcpay_invoice_id", null: false
    t.string "plan", null: false
    t.boolean "success", default: false, null: false
  end

  create_table "chat_blocks", force: :cascade do |t|
    t.integer "account_id", null: false
    t.integer "target_account_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "target_account_id"], name: "index_chat_blocks_on_account_id_and_target_account_id", unique: true
  end

  create_table "chat_conversation_accounts", id: :bigint, default: -> { "timestamp_id('chat_conversation_accounts'::text)" }, force: :cascade do |t|
    t.bigint "account_id"
    t.bigint "chat_conversation_id"
    t.bigint "participant_account_ids", default: [], null: false, array: true
    t.boolean "is_hidden", default: false, null: false
    t.boolean "is_approved", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "unread_count", default: 0
    t.string "chat_message_expiration_policy"
    t.boolean "is_muted", default: false, null: false
    t.boolean "is_pinned", default: false, null: false
    t.datetime "left_group_chat_at"
    t.index ["account_id"], name: "index_chat_conversation_accounts_on_account_id"
    t.index ["chat_conversation_id"], name: "index_chat_conversation_accounts_on_chat_conversation_id"
  end

  create_table "chat_conversations", id: :bigint, default: -> { "timestamp_id('chat_conversations'::text)" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "last_chat_message_id"
    t.datetime "last_chat_message_sent_at"
  end

  create_table "chat_messages", id: :bigint, default: -> { "timestamp_id('chat_messages'::text)" }, force: :cascade do |t|
    t.text "language", default: "", null: false
    t.integer "from_account_id", null: false
    t.bigint "chat_conversation_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "expires_at"
    t.text "text_ciphertext"
    t.index ["from_account_id", "chat_conversation_id"], name: "index_chat_messages_on_from_account_id_and_chat_conversation_id"
  end

  create_table "comment_trees", primary_key: "status_id", id: :bigint, default: nil, force: :cascade do |t|
    t.ltree "comment_path"
    t.index ["comment_path"], name: "index_comment_trees_path_gist", using: :gist
    t.index ["status_id"], name: "index_comment_trees_status_id_brin", using: :brin
  end

  create_table "conversations", force: :cascade do |t|
    t.string "uri"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["id", "created_at"], name: "index_conversations_on_id_and_created_at_brin", using: :brin
    t.index ["uri"], name: "index_conversations_on_uri", unique: true
  end

  create_table "custom_emojis", force: :cascade do |t|
    t.string "shortcode", default: "", null: false
    t.string "domain"
    t.string "image_file_name"
    t.string "image_content_type"
    t.integer "image_file_size"
    t.datetime "image_updated_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "uri"
    t.string "image_remote_url"
    t.boolean "visible_in_picker", default: true, null: false
    t.index ["shortcode", "domain"], name: "index_custom_emojis_on_shortcode_and_domain", unique: true
  end

  create_table "custom_filters", force: :cascade do |t|
    t.bigint "account_id"
    t.datetime "expires_at"
    t.text "phrase", default: "", null: false
    t.string "context", default: [], null: false, array: true
    t.boolean "irreversible", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "whole_word", default: true, null: false
    t.index ["account_id"], name: "index_custom_filters_on_account_id"
  end

  create_table "email_domain_blocks", force: :cascade do |t|
    t.string "domain", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["domain"], name: "index_email_domain_blocks_on_domain", unique: true
  end

  create_table "favourites", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "account_id", null: false
    t.bigint "status_id", null: false
    t.index ["account_id", "id"], name: "index_favourites_on_account_id_and_id"
    t.index ["account_id", "status_id"], name: "index_favourites_on_account_id_and_status_id", unique: true
    t.index ["account_id"], name: "index_favourites_on_account_id", using: :hash
    t.index ["created_at", "status_id"], name: "index_favourites_on_status_id_ca_brin", using: :brin
    t.index ["status_id"], name: "index_favourites_on_status_id"
    t.index ["status_id"], name: "index_favourites_on_status_id_brin", using: :brin
  end

  create_table "follow_requests", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "account_id", null: false
    t.bigint "target_account_id", null: false
    t.boolean "show_reblogs", default: true, null: false
    t.string "uri"
    t.index ["account_id", "target_account_id"], name: "index_follow_requests_on_account_id_and_target_account_id", unique: true
  end

  create_table "follows", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "account_id", null: false
    t.bigint "target_account_id", null: false
    t.boolean "show_reblogs", default: true, null: false
    t.string "uri"
    t.index ["account_id", "target_account_id"], name: "index_follows_on_account_id_and_target_account_id", unique: true
    t.index ["target_account_id", "account_id", "id"], name: "index_follows_on_tai_ai_id_desc", order: { id: :desc }
    t.index ["target_account_id", "id", "account_id"], name: "index_follows_on_target_account_id_and_id_desc_and_account_id", order: { id: :desc }
  end

  create_table "group_accounts", force: :cascade do |t|
    t.bigint "group_id", null: false
    t.bigint "account_id", null: false
    t.boolean "write_permissions", default: false, null: false
    t.string "role"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "group_id"], name: "index_group_accounts_on_account_id_and_group_id", unique: true
    t.index ["group_id", "account_id"], name: "index_group_accounts_on_group_id_and_account_id"
  end

  create_table "group_categories", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "text", default: "", null: false
  end

  create_table "group_join_requests", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "group_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "group_id"], name: "index_group_join_requests_on_account_id_and_group_id", unique: true
    t.index ["group_id"], name: "index_group_join_requests_on_group_id"
  end

  create_table "group_pinned_statuses", force: :cascade do |t|
    t.bigint "status_id", null: false
    t.bigint "group_id", null: false
    t.index ["group_id"], name: "index_group_pinned_statuses_on_group_id"
    t.index ["status_id", "group_id"], name: "index_group_pinned_statuses_on_status_id_and_group_id", unique: true
  end

  create_table "group_removed_accounts", force: :cascade do |t|
    t.bigint "group_id", null: false
    t.bigint "account_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "group_id"], name: "index_group_removed_accounts_on_account_id_and_group_id", unique: true
    t.index ["group_id", "account_id"], name: "index_group_removed_accounts_on_group_id_and_account_id"
  end

  create_table "groups", force: :cascade do |t|
    t.bigint "account_id"
    t.string "title", null: false
    t.string "description", null: false
    t.string "cover_image_file_name"
    t.string "cover_image_content_type"
    t.integer "cover_image_file_size"
    t.datetime "cover_image_updated_at"
    t.boolean "is_nsfw", default: false, null: false
    t.boolean "is_featured", default: false, null: false
    t.boolean "is_archived", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "member_count", default: 0
    t.text "slug"
    t.boolean "is_private", default: false
    t.boolean "is_visible", default: true
    t.string "tags", default: [], array: true
    t.string "password"
    t.integer "group_category_id"
    t.index ["account_id"], name: "index_groups_on_account_id"
    t.index ["slug"], name: "index_groups_on_slug", unique: true
  end

  create_table "identities", force: :cascade do |t|
    t.string "provider", default: "", null: false
    t.string "uid", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id"
    t.index ["user_id"], name: "index_identities_on_user_id"
  end

  create_table "link_blocks", force: :cascade do |t|
    t.string "link", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["link"], name: "index_link_blocks_on_link", unique: true
  end

  create_table "list_accounts", force: :cascade do |t|
    t.bigint "list_id", null: false
    t.bigint "account_id", null: false
    t.bigint "follow_id"
    t.index ["account_id", "list_id"], name: "index_list_accounts_on_account_id_and_list_id", unique: true
    t.index ["follow_id"], name: "index_list_accounts_on_follow_id"
    t.index ["list_id", "account_id"], name: "index_list_accounts_on_list_id_and_account_id"
  end

  create_table "list_removed_accounts", force: :cascade do |t|
    t.bigint "list_id", null: false
    t.bigint "account_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["account_id"], name: "index_list_removed_accounts_on_account_id"
    t.index ["list_id"], name: "index_list_removed_accounts_on_list_id"
  end

  create_table "list_subscribers", force: :cascade do |t|
    t.bigint "list_id", null: false
    t.bigint "account_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["account_id"], name: "index_list_subscribers_on_account_id"
    t.index ["list_id"], name: "index_list_subscribers_on_list_id"
  end

  create_table "lists", id: :bigint, default: -> { "timestamp_id('lists'::text)" }, force: :cascade do |t|
    t.bigint "account_id", null: false
    t.string "title", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "visibility", default: 0, null: false
    t.integer "subscriber_count", default: 0, null: false
    t.string "slug"
    t.boolean "is_featured"
    t.index ["account_id"], name: "index_lists_on_account_id"
    t.index ["slug"], name: "index_lists_on_slug", unique: true
  end

  create_table "media_attachment_albums", force: :cascade do |t|
    t.text "title", default: "", null: false
    t.text "description"
    t.integer "account_id", null: false
    t.integer "visibility", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "cover_id"
    t.integer "count", default: 0, null: false
    t.index ["cover_id"], name: "index_media_attachment_albums_on_cover_id"
  end

  create_table "media_attachments", force: :cascade do |t|
    t.bigint "status_id"
    t.string "file_file_name"
    t.string "file_content_type"
    t.integer "file_file_size"
    t.datetime "file_updated_at"
    t.string "remote_url", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "shortcode"
    t.integer "type", default: 0, null: false
    t.json "file_meta"
    t.bigint "account_id"
    t.text "description"
    t.bigint "scheduled_status_id"
    t.string "blurhash"
    t.bigint "media_attachment_album_id"
    t.index ["account_id", "type", "status_id"], name: "index_media_attachments_on_account_type_status"
    t.index ["id", "status_id", "created_at"], name: "index_media_attachments_on_id_status_id_created_at_brin", using: :brin
    t.index ["scheduled_status_id"], name: "index_media_attachments_on_scheduled_status_id"
    t.index ["shortcode"], name: "index_media_attachments_on_shortcode", unique: true
    t.index ["status_id"], name: "index_media_attachments_on_status_id"
    t.index ["type"], name: "index_media_attachments_on_type"
  end

  create_table "mentions", force: :cascade do |t|
    t.bigint "status_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "account_id"
    t.boolean "silent", default: false, null: false
    t.index ["account_id", "status_id"], name: "index_mentions_on_account_id_and_status_id", unique: true
    t.index ["created_at", "status_id"], name: "index_mentions_status_id_created_at_brin", using: :brin
    t.index ["status_id"], name: "index_mentions_on_status_id"
  end

  create_table "mutes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "hide_notifications", default: true, null: false
    t.bigint "account_id", null: false
    t.bigint "target_account_id", null: false
    t.index ["account_id", "target_account_id", "hide_notifications"], name: "index_mutes_on_account_id_and_target_account_id_hn"
    t.index ["account_id", "target_account_id"], name: "index_mutes_on_account_id_and_target_account_id", unique: true
    t.index ["target_account_id"], name: "index_mutes_on_target_account_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.bigint "activity_id", null: false
    t.string "activity_type", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "account_id", null: false
    t.bigint "from_account_id", null: false
    t.index ["account_id", "activity_id", "activity_type"], name: "account_activity", unique: true
    t.index ["account_id", "id"], name: "index_notifications_on_account_id_and_id", order: { id: :desc }
    t.index ["activity_id", "activity_type"], name: "index_notifications_on_activity_id_and_activity_type"
    t.index ["from_account_id"], name: "index_notifications_on_from_account_id"
  end

  create_table "oauth_access_grants", force: :cascade do |t|
    t.string "token", null: false
    t.integer "expires_in", null: false
    t.text "redirect_uri", null: false
    t.datetime "created_at", null: false
    t.datetime "revoked_at"
    t.string "scopes"
    t.bigint "application_id", null: false
    t.bigint "resource_owner_id", null: false
    t.index ["resource_owner_id"], name: "index_oauth_access_grants_on_resource_owner_id"
    t.index ["token"], name: "index_oauth_access_grants_on_token", unique: true
  end

  create_table "oauth_access_tokens", force: :cascade do |t|
    t.string "token", null: false
    t.string "refresh_token"
    t.integer "expires_in"
    t.datetime "revoked_at"
    t.datetime "created_at", null: false
    t.string "scopes"
    t.bigint "application_id"
    t.bigint "resource_owner_id"
    t.index ["refresh_token"], name: "index_oauth_access_tokens_on_refresh_token", unique: true
    t.index ["resource_owner_id"], name: "index_oauth_access_tokens_on_resource_owner_id"
    t.index ["token"], name: "index_oauth_access_tokens_on_token", unique: true
  end

  create_table "oauth_applications", force: :cascade do |t|
    t.string "name", null: false
    t.string "uid", null: false
    t.string "secret", null: false
    t.text "redirect_uri", null: false
    t.string "scopes", default: "", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean "superapp", default: false, null: false
    t.string "website"
    t.string "owner_type"
    t.bigint "owner_id"
    t.boolean "confidential", default: true, null: false
    t.index ["owner_id", "owner_type"], name: "index_oauth_applications_on_owner_id_and_owner_type"
    t.index ["uid"], name: "index_oauth_applications_on_uid", unique: true
  end

  create_table "pghero_space_stats", force: :cascade do |t|
    t.text "database"
    t.text "schema"
    t.text "relation"
    t.bigint "size"
    t.datetime "captured_at"
    t.index ["database", "captured_at"], name: "index_pghero_space_stats_on_database_and_captured_at"
  end

  create_table "poll_votes", force: :cascade do |t|
    t.bigint "account_id"
    t.bigint "poll_id"
    t.integer "choice", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "uri"
    t.index ["account_id"], name: "index_poll_votes_on_account_id"
    t.index ["poll_id"], name: "index_poll_votes_on_poll_id"
  end

  create_table "polls", force: :cascade do |t|
    t.bigint "account_id"
    t.bigint "status_id"
    t.datetime "expires_at"
    t.string "options", default: [], null: false, array: true
    t.bigint "cached_tallies", default: [], null: false, array: true
    t.boolean "multiple", default: false, null: false
    t.boolean "hide_totals", default: false, null: false
    t.bigint "votes_count", default: 0, null: false
    t.datetime "last_fetched_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "lock_version", default: 0, null: false
    t.index ["account_id"], name: "index_polls_on_account_id"
    t.index ["created_at"], name: "index_polls_on_created_at"
    t.index ["id", "lock_version"], name: "index_polls_on_id_and_lock_version"
    t.index ["status_id"], name: "index_polls_on_status_id"
  end

  create_table "preview_cards", force: :cascade do |t|
    t.string "url", default: "", null: false
    t.string "title", default: "", null: false
    t.string "description", default: "", null: false
    t.string "image_file_name"
    t.string "image_content_type"
    t.integer "image_file_size"
    t.datetime "image_updated_at"
    t.integer "type", default: 0, null: false
    t.text "html", default: "", null: false
    t.string "author_name", default: "", null: false
    t.string "author_url", default: "", null: false
    t.string "provider_name", default: "", null: false
    t.string "provider_url", default: "", null: false
    t.integer "width", default: 0, null: false
    t.integer "height", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "embed_url", default: "", null: false
    t.index ["url"], name: "index_preview_cards_on_url", unique: true
  end

  create_table "preview_cards_statuses", id: false, force: :cascade do |t|
    t.bigint "preview_card_id", null: false
    t.bigint "status_id", null: false
    t.index ["preview_card_id", "status_id"], name: "index_preview_cards_statuses_on_preview_card_id_and_status_id"
    t.index ["status_id", "preview_card_id"], name: "index_preview_cards_statuses_on_status_id_and_preview_card_id"
  end

  create_table "promotions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "expires_at"
    t.bigint "status_id", null: false
    t.string "timeline_id"
    t.integer "position", default: 10
  end

  create_table "report_notes", force: :cascade do |t|
    t.text "content", null: false
    t.bigint "report_id", null: false
    t.bigint "account_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_report_notes_on_account_id"
    t.index ["report_id"], name: "index_report_notes_on_report_id"
  end

  create_table "reports", force: :cascade do |t|
    t.bigint "status_ids", default: [], null: false, array: true
    t.text "comment", default: "", null: false
    t.boolean "action_taken", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "account_id", null: false
    t.bigint "action_taken_by_account_id"
    t.bigint "target_account_id", null: false
    t.bigint "assigned_account_id"
    t.string "uri"
    t.integer "category", limit: 2
    t.index ["account_id"], name: "index_reports_on_account_id"
    t.index ["action_taken"], name: "index_reports_on_action_taken"
    t.index ["target_account_id"], name: "index_reports_on_target_account_id"
  end

  create_table "scheduled_statuses", force: :cascade do |t|
    t.bigint "account_id"
    t.datetime "scheduled_at"
    t.jsonb "params"
    t.index ["account_id"], name: "index_scheduled_statuses_on_account_id"
    t.index ["scheduled_at"], name: "index_scheduled_statuses_on_scheduled_at"
  end

  create_table "session_activations", force: :cascade do |t|
    t.string "session_id", null: false
    t.datetime "created_at", default: -> { "now()" }, null: false
    t.datetime "updated_at", default: -> { "now()" }, null: false
    t.string "user_agent", default: "", null: false
    t.inet "ip"
    t.bigint "access_token_id"
    t.bigint "user_id", null: false
    t.bigint "web_push_subscription_id"
    t.index ["access_token_id"], name: "index_session_activations_on_access_token_id"
    t.index ["id", "created_at", "updated_at", "access_token_id"], name: "session_activations_id_ca_ua_atid_brin", using: :brin
    t.index ["session_id"], name: "index_session_activations_on_session_id", unique: true
    t.index ["user_id"], name: "index_session_activations_on_user_id"
  end

  create_table "settings", force: :cascade do |t|
    t.string "var", null: false
    t.text "value"
    t.string "thing_type"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.bigint "thing_id"
    t.index ["thing_type", "thing_id", "var"], name: "index_settings_on_thing_type_and_thing_id_and_var", unique: true
  end

  create_table "shortcuts", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "account_id", null: false
    t.bigint "shortcut_id", null: false
    t.string "shortcut_type", default: "", null: false
    t.index ["account_id", "shortcut_id", "shortcut_type"], name: "index_shortcuts_on_account_id_and_shortcut_id_and_shortcut_type", unique: true
  end

  create_table "site_uploads", force: :cascade do |t|
    t.string "var", default: "", null: false
    t.string "file_file_name"
    t.string "file_content_type"
    t.integer "file_file_size"
    t.datetime "file_updated_at"
    t.json "meta"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["var"], name: "index_site_uploads_on_var", unique: true
  end

  create_table "status_bookmark_collections", force: :cascade do |t|
    t.text "title", default: "", null: false
    t.integer "account_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "status_bookmarks", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "account_id", null: false
    t.bigint "status_id", null: false
    t.bigint "status_bookmark_collection_id"
    t.index ["account_id", "status_id"], name: "index_status_bookmarks_on_account_id_and_status_id", unique: true
    t.index ["status_bookmark_collection_id"], name: "index_status_bookmarks_on_status_bookmark_collection_id"
    t.index ["status_id"], name: "index_status_bookmarks_on_status_id"
  end

  create_table "status_pins", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "status_id", null: false
    t.datetime "created_at", default: -> { "now()" }, null: false
    t.datetime "updated_at", default: -> { "now()" }, null: false
    t.index ["account_id", "status_id"], name: "index_status_pins_on_account_id_and_status_id", unique: true
    t.index ["created_at", "status_id"], name: "index_status_pins_on_created_at_status_id_brin", using: :brin
  end

  create_table "status_revisions", force: :cascade do |t|
    t.bigint "status_id"
    t.string "text"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["status_id"], name: "index_status_revisions_on_status_id"
  end

  create_table "status_stats", force: :cascade do |t|
    t.bigint "status_id", null: false
    t.bigint "replies_count", default: 0, null: false
    t.bigint "reblogs_count", default: 0, null: false
    t.bigint "favourites_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at", "status_id"], name: "index_status_stats_on_status_id_brin", using: :brin
    t.index ["created_at"], name: "index_status_stats_on_created_at_desc", order: :desc
    t.index ["favourites_count"], name: "index_status_stats_on_favourites_count"
    t.index ["favourites_count"], name: "index_status_stats_on_favourites_count_desc", order: :desc
    t.index ["reblogs_count"], name: "index_status_stats_on_reblogs_count"
    t.index ["replies_count"], name: "index_status_stats_on_replies_count"
    t.index ["status_id"], name: "index_status_stats_on_status_id", unique: true
    t.index ["status_id"], name: "index_status_stats_on_status_id_desc", order: :desc
    t.index ["updated_at"], name: "index_status_stats_on_updated_at"
  end

  create_table "status_tombstones", force: :cascade do |t|
    t.bigint "status_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["status_id"], name: "index_status_tombstones_on_status_id"
  end

  create_table "statuses", id: :bigint, default: -> { "timestamp_id('statuses'::text)" }, force: :cascade do |t|
    t.string "uri"
    t.text "text", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "in_reply_to_id"
    t.bigint "reblog_of_id"
    t.string "url"
    t.boolean "sensitive", default: false, null: false
    t.integer "visibility", default: 0, null: false
    t.text "spoiler_text", default: "", null: false
    t.boolean "reply", default: false, null: false
    t.string "language"
    t.bigint "conversation_id"
    t.boolean "local"
    t.bigint "account_id", null: false
    t.bigint "application_id"
    t.bigint "in_reply_to_account_id"
    t.bigint "poll_id"
    t.integer "group_id"
    t.bigint "quote_of_id"
    t.datetime "revised_at"
    t.text "markdown"
    t.datetime "expires_at"
    t.boolean "has_quote"
    t.datetime "tombstoned_at"
    t.index ["account_id", "id", "visibility", "created_at"], name: "index_statuses_account_id_vis_ca_nt", order: { id: :desc }, where: "(tombstoned_at IS NULL)"
    t.index ["account_id"], name: "index_statuses_account_id_ot", where: "(tombstoned_at IS NOT NULL)"
    t.index ["created_at", "account_id", "group_id", "reblog_of_id", "visibility"], name: "index_statuses_ca_desc_aid_gid_reb_vis_nt", order: { created_at: :desc }, where: "(tombstoned_at IS NULL)"
    t.index ["created_at", "account_id", "reblog_of_id", "reply"], name: "index_statuses_ca_aid_reb_rep_nt_defvis", order: { created_at: :desc }, where: "((visibility = ANY (ARRAY[0, 1])) AND (tombstoned_at IS NULL))"
    t.index ["created_at", "id"], name: "index_statuses_on_created_at_andid_brin", using: :brin
    t.index ["created_at", "reblog_of_id", "visibility", "group_id", "account_id"], name: "index_statuses_created_reb_vis_aid_gid_nt_nr", order: { created_at: :desc }, where: "((tombstoned_at IS NULL) AND (reply IS FALSE))"
    t.index ["created_at", "reblog_of_id", "visibility", "group_id", "account_id"], name: "index_statuses_created_reb_vis_aid_gidnn_nt_nr", order: { created_at: :desc }, where: "((tombstoned_at IS NULL) AND (reply IS FALSE) AND (group_id IS NOT NULL))"
    t.index ["created_at", "reply", "reblog_of_id", "visibility", "group_id", "account_id"], name: "index_statuses_created_rep_reb_vis_aid_gid_nt", order: { created_at: :desc }, where: "(tombstoned_at IS NULL)"
    t.index ["created_at", "visibility", "group_id", "account_id"], name: "index_statuses_vis_aid_gid_nt_nrb_nr", order: { created_at: :desc }, where: "((tombstoned_at IS NULL) AND (reply IS FALSE) AND (reblog_of_id IS NULL))"
    t.index ["group_id", "reply", "reblog_of_id", "account_id"], name: "index_statuses_group_id_reply_nt", where: "(tombstoned_at IS NULL)"
    t.index ["in_reply_to_account_id"], name: "index_statuses_on_in_reply_to_account_id"
    t.index ["in_reply_to_id"], name: "index_statuses_on_in_reply_to_id_desc", order: "DESC NULLS LAST"
    t.index ["quote_of_id"], name: "index_statuses_on_quote_of_id"
    t.index ["reblog_of_id", "account_id"], name: "index_statuses_on_reblog_of_id_and_account_id_nt", where: "(tombstoned_at IS NULL)"
    t.index ["reblog_of_id", "account_id"], name: "index_statuses_reblog_inclactid_desc", order: { reblog_of_id: :desc }, where: "(reblog_of_id IS NOT NULL)"
    t.index ["reblog_of_id"], name: "index_statuses_on_reblog_of_id", where: "(tombstoned_at IS NULL)"
    t.index ["updated_at"], name: "index_statuses_on_updated_at"
    t.index ["uri"], name: "index_statuses_on_uri", where: "(tombstoned_at IS NULL)"
  end

  create_table "statuses_tags", id: false, force: :cascade do |t|
    t.bigint "status_id", null: false
    t.bigint "tag_id", null: false
    t.index ["status_id"], name: "index_statuses_tags_on_status_id"
    t.index ["status_id"], name: "index_statuses_tags_status_id_brin", using: :brin
    t.index ["tag_id", "status_id"], name: "index_statuses_tags_on_tag_id_and_status_id", unique: true
  end

  create_table "tags", force: :cascade do |t|
    t.string "name", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_tags_on_name", unique: true
  end

  create_table "tombstones", force: :cascade do |t|
    t.bigint "account_id"
    t.string "uri", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "by_moderator"
    t.index ["account_id"], name: "index_tombstones_on_account_id"
    t.index ["uri"], name: "index_tombstones_on_uri"
  end

  create_table "transactions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "account_id", null: false
    t.string "payment_type"
    t.string "provider_type"
    t.text "provider_response"
    t.integer "amount", null: false
    t.boolean "success", default: false, null: false
  end

  create_table "unfavourites", force: :cascade do |t|
    t.bigint "account_id"
    t.bigint "status_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["account_id"], name: "index_unfavourites_on_account_id"
    t.index ["created_at"], name: "index_unfavourites_on_created_at_id_brin", using: :brin
    t.index ["status_id"], name: "index_unfavourites_on_status_id"
  end

  create_table "unfollows", force: :cascade do |t|
    t.bigint "account_id"
    t.bigint "target_account_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["account_id"], name: "index_unfollows_on_account_id"
    t.index ["target_account_id"], name: "index_unfollows_on_target_account_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet "current_sign_in_ip"
    t.inet "last_sign_in_ip"
    t.boolean "admin", default: false, null: false
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.string "locale"
    t.string "encrypted_otp_secret"
    t.string "encrypted_otp_secret_iv"
    t.string "encrypted_otp_secret_salt"
    t.integer "consumed_timestep"
    t.boolean "otp_required_for_login", default: false, null: false
    t.datetime "last_emailed_at"
    t.string "otp_backup_codes", array: true
    t.string "filtered_languages", default: [], null: false, array: true
    t.bigint "account_id", null: false
    t.boolean "disabled", default: false, null: false
    t.boolean "moderator", default: false, null: false
    t.string "remember_token"
    t.string "chosen_languages", array: true
    t.bigint "created_by_application_id"
    t.boolean "approved", default: true, null: false
    t.bigint "last_read_notification"
    t.string "unique_email"
    t.index ["account_id"], name: "index_users_on_account_id"
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["created_at"], name: "index_users_on_created_at"
    t.index ["created_by_application_id"], name: "index_users_on_created_by_application_id"
    t.index ["current_sign_in_at"], name: "index_users_on_current_sign_in_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["remember_token"], name: "index_users_on_remember_token"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["unconfirmed_email"], name: "index_users_on_unconfirmed_email"
    t.index ["unique_email"], name: "index_users_on_unique_email"
  end

  create_table "web_push_subscriptions", force: :cascade do |t|
    t.string "endpoint", null: false
    t.string "key_p256dh", null: false
    t.string "key_auth", null: false
    t.json "data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "access_token_id"
    t.bigint "user_id"
    t.index ["access_token_id"], name: "index_web_push_subscriptions_on_access_token_id"
    t.index ["user_id"], name: "index_web_push_subscriptions_on_user_id"
  end

  create_table "web_settings", force: :cascade do |t|
    t.json "data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_web_settings_on_user_id", unique: true
  end

  add_foreign_key "account_conversations", "accounts", on_delete: :cascade
  add_foreign_key "account_conversations", "conversations", on_delete: :cascade
  add_foreign_key "account_moderation_notes", "accounts"
  add_foreign_key "account_moderation_notes", "accounts", column: "target_account_id"
  add_foreign_key "account_stats", "accounts", on_delete: :cascade
  add_foreign_key "account_tag_stats", "tags", on_delete: :cascade
  add_foreign_key "account_username_changes", "accounts", on_delete: :cascade
  add_foreign_key "account_warnings", "accounts", column: "target_account_id", on_delete: :cascade
  add_foreign_key "account_warnings", "accounts", on_delete: :nullify
  add_foreign_key "accounts", "accounts", column: "moved_to_account_id", on_delete: :nullify
  add_foreign_key "admin_action_logs", "accounts", on_delete: :cascade
  add_foreign_key "backups", "users", on_delete: :nullify
  add_foreign_key "blocks", "accounts", column: "target_account_id", name: "fk_9571bfabc1", on_delete: :cascade
  add_foreign_key "blocks", "accounts", name: "fk_4269e03e65", on_delete: :cascade
  add_foreign_key "chat_blocks", "accounts", column: "target_account_id", on_delete: :cascade
  add_foreign_key "chat_blocks", "accounts", on_delete: :cascade
  add_foreign_key "chat_conversation_accounts", "accounts", on_delete: :cascade
  add_foreign_key "chat_conversation_accounts", "chat_conversations", on_delete: :cascade
  add_foreign_key "chat_conversations", "chat_messages", column: "last_chat_message_id", on_delete: :nullify
  add_foreign_key "chat_messages", "accounts", column: "from_account_id", on_delete: :cascade
  add_foreign_key "chat_messages", "chat_conversations", on_delete: :cascade
  add_foreign_key "comment_trees", "statuses", name: "fk_comment_trees_status_id", on_delete: :cascade
  add_foreign_key "custom_filters", "accounts", on_delete: :cascade
  add_foreign_key "favourites", "accounts", name: "fk_5eb6c2b873", on_delete: :cascade
  add_foreign_key "favourites", "statuses", name: "fk_b0e856845e", on_delete: :cascade
  add_foreign_key "follow_requests", "accounts", column: "target_account_id", name: "fk_9291ec025d", on_delete: :cascade
  add_foreign_key "follow_requests", "accounts", name: "fk_76d644b0e7", on_delete: :cascade
  add_foreign_key "follows", "accounts", column: "target_account_id", name: "fk_745ca29eac", on_delete: :cascade
  add_foreign_key "follows", "accounts", name: "fk_32ed1b5560", on_delete: :cascade
  add_foreign_key "group_accounts", "accounts", on_delete: :cascade
  add_foreign_key "group_accounts", "groups", on_delete: :cascade
  add_foreign_key "group_join_requests", "accounts", on_delete: :cascade
  add_foreign_key "group_join_requests", "groups", on_delete: :cascade
  add_foreign_key "group_pinned_statuses", "groups", on_delete: :cascade
  add_foreign_key "group_pinned_statuses", "statuses", on_delete: :cascade
  add_foreign_key "group_removed_accounts", "accounts", on_delete: :cascade
  add_foreign_key "group_removed_accounts", "groups", on_delete: :cascade
  add_foreign_key "groups", "group_categories", on_delete: :nullify
  add_foreign_key "identities", "users", name: "fk_bea040f377", on_delete: :cascade
  add_foreign_key "list_accounts", "accounts", on_delete: :cascade
  add_foreign_key "list_accounts", "follows", on_delete: :cascade
  add_foreign_key "list_accounts", "lists", on_delete: :cascade
  add_foreign_key "list_removed_accounts", "accounts", on_delete: :cascade
  add_foreign_key "list_removed_accounts", "lists", on_delete: :cascade
  add_foreign_key "list_subscribers", "accounts", on_delete: :cascade
  add_foreign_key "list_subscribers", "lists", on_delete: :cascade
  add_foreign_key "lists", "accounts", on_delete: :cascade
  add_foreign_key "media_attachment_albums", "accounts", on_delete: :cascade
  add_foreign_key "media_attachment_albums", "media_attachments", column: "cover_id", on_delete: :nullify
  add_foreign_key "media_attachments", "accounts", name: "fk_96dd81e81b", on_delete: :nullify
  add_foreign_key "media_attachments", "media_attachment_albums", on_delete: :nullify
  add_foreign_key "media_attachments", "scheduled_statuses", on_delete: :nullify
  add_foreign_key "media_attachments", "statuses", on_delete: :nullify
  add_foreign_key "mentions", "accounts", name: "fk_970d43f9d1", on_delete: :cascade
  add_foreign_key "mentions", "statuses", on_delete: :cascade
  add_foreign_key "mutes", "accounts", column: "target_account_id", name: "fk_eecff219ea", on_delete: :cascade
  add_foreign_key "mutes", "accounts", name: "fk_b8d8daf315", on_delete: :cascade
  add_foreign_key "notifications", "accounts", column: "from_account_id", name: "fk_fbd6b0bf9e", on_delete: :cascade
  add_foreign_key "notifications", "accounts", name: "fk_c141c8ee55", on_delete: :cascade
  add_foreign_key "oauth_access_grants", "oauth_applications", column: "application_id", name: "fk_34d54b0a33", on_delete: :cascade
  add_foreign_key "oauth_access_grants", "users", column: "resource_owner_id", name: "fk_63b044929b", on_delete: :cascade
  add_foreign_key "oauth_access_tokens", "oauth_applications", column: "application_id", name: "fk_f5fc4c1ee3", on_delete: :cascade
  add_foreign_key "oauth_access_tokens", "users", column: "resource_owner_id", name: "fk_e84df68546", on_delete: :cascade
  add_foreign_key "oauth_applications", "users", column: "owner_id", name: "fk_b0988c7c0a", on_delete: :cascade
  add_foreign_key "poll_votes", "accounts", on_delete: :cascade
  add_foreign_key "poll_votes", "polls", on_delete: :cascade
  add_foreign_key "polls", "accounts", on_delete: :cascade
  add_foreign_key "polls", "statuses", on_delete: :cascade
  add_foreign_key "report_notes", "accounts", on_delete: :cascade
  add_foreign_key "report_notes", "reports", on_delete: :cascade
  add_foreign_key "reports", "accounts", column: "action_taken_by_account_id", name: "fk_bca45b75fd", on_delete: :nullify
  add_foreign_key "reports", "accounts", column: "assigned_account_id", on_delete: :nullify
  add_foreign_key "reports", "accounts", column: "target_account_id", name: "fk_eb37af34f0", on_delete: :cascade
  add_foreign_key "reports", "accounts", name: "fk_4b81f7522c", on_delete: :cascade
  add_foreign_key "scheduled_statuses", "accounts", on_delete: :cascade
  add_foreign_key "session_activations", "oauth_access_tokens", column: "access_token_id", name: "fk_957e5bda89", on_delete: :cascade
  add_foreign_key "session_activations", "users", name: "fk_e5fda67334", on_delete: :cascade
  add_foreign_key "shortcuts", "accounts", on_delete: :cascade
  add_foreign_key "status_bookmark_collections", "accounts", on_delete: :cascade
  add_foreign_key "status_bookmarks", "accounts", on_delete: :cascade
  add_foreign_key "status_bookmarks", "status_bookmark_collections", on_delete: :nullify
  add_foreign_key "status_bookmarks", "statuses", on_delete: :cascade
  add_foreign_key "status_pins", "accounts", name: "fk_d4cb435b62", on_delete: :cascade
  add_foreign_key "status_pins", "statuses", on_delete: :cascade
  add_foreign_key "status_stats", "statuses", on_delete: :cascade
  add_foreign_key "status_tombstones", "statuses", on_delete: :cascade
  add_foreign_key "statuses", "accounts", column: "in_reply_to_account_id", name: "fk_c7fa917661", on_delete: :nullify
  add_foreign_key "statuses", "accounts", name: "fk_9bda1543f7", on_delete: :cascade
  add_foreign_key "statuses", "groups", on_delete: :nullify
  add_foreign_key "statuses", "statuses", column: "in_reply_to_id", on_delete: :nullify
  add_foreign_key "statuses", "statuses", column: "quote_of_id", on_delete: :nullify
  add_foreign_key "statuses", "statuses", column: "reblog_of_id", on_delete: :cascade
  add_foreign_key "statuses_tags", "statuses", on_delete: :cascade
  add_foreign_key "statuses_tags", "tags", name: "fk_3081861e21", on_delete: :cascade
  add_foreign_key "tombstones", "accounts", on_delete: :cascade
  add_foreign_key "unfavourites", "accounts", on_delete: :cascade
  add_foreign_key "unfavourites", "statuses", on_delete: :cascade
  add_foreign_key "unfollows", "accounts", column: "target_account_id", on_delete: :cascade
  add_foreign_key "unfollows", "accounts", on_delete: :cascade
  add_foreign_key "users", "accounts", name: "fk_50500f500d", on_delete: :cascade
  add_foreign_key "users", "oauth_applications", column: "created_by_application_id", on_delete: :nullify
  add_foreign_key "web_push_subscriptions", "oauth_access_tokens", column: "access_token_id", on_delete: :cascade
  add_foreign_key "web_push_subscriptions", "users", on_delete: :cascade
  add_foreign_key "web_settings", "users", name: "fk_11910667b2", on_delete: :cascade
  create_function :timestamp_id, sql_definition: <<-SQL
      CREATE OR REPLACE FUNCTION public.timestamp_id(table_name text)
       RETURNS bigint
       LANGUAGE plpgsql
      AS $function$
        DECLARE
          time_part bigint;
          sequence_base bigint;
          tail bigint;
        BEGIN
          time_part := (
            -- Get the time in milliseconds
            ((date_part('epoch', now()) * 1000))::bigint
            -- And shift it over two bytes
            << 16);

          sequence_base := (
            'x' ||
            -- Take the first two bytes (four hex characters)
            substr(
              -- Of the MD5 hash of the data we documented
              md5(table_name ||
                '#{SecureRandom.hex(16)}' ||
                time_part::text
              ),
              1, 4
            )
          -- And turn it into a bigint
          )::bit(16)::bigint;

          -- Finally, add our sequence number to our base, and chop
          -- it to the last two bytes
          tail := (
            (sequence_base + nextval(table_name || '_id_seq'))
            & 65535);

          -- Return the time part and the sequence part. OR appears
          -- faster here than addition, but they're equivalent:
          -- time_part has no trailing two bytes, and tail is only
          -- the last two bytes.
          RETURN time_part | tail;
        END
      $function$
  SQL
  create_function :row_estimator, sql_definition: <<-SQL
      CREATE OR REPLACE FUNCTION public.row_estimator(query text)
       RETURNS bigint
       LANGUAGE plpgsql
      AS $function$DECLARE
         plan jsonb;
      BEGIN
         EXECUTE 'EXPLAIN (FORMAT JSON) ' || query INTO plan;

         RETURN (plan->0->'Plan'->>'Plan Rows')::bigint;
      END;$function$
  SQL
  create_function :function_get_parent_comment_tree, sql_definition: <<-SQL
      CREATE OR REPLACE FUNCTION public.function_get_parent_comment_tree(child_status_id bigint)
       RETURNS ltree
       LANGUAGE plpgsql
      AS $function$
      declare mypath varchar ; begin
       -- logic
        WITH RECURSIVE cte AS(
          select id as Child, in_reply_to_id as Parent, id || ''  as Tree from statuses where id = child_status_id
          UNION ALL
          select id as Child, in_reply_to_id as Parent, Parent || '.' || Tree  as Tree from statuses s
          INNER JOIN cte c on c.Parent = s.id
        ) select text2ltree(cte.Parent || '.' || Tree) as path from cte order by parent asc limit 1 into mypath;
        if nlevel(text2ltree(mypath)) > 4 then
          mypath = subpath(text2ltree(mypath), 0, 1) || subpath(text2ltree(mypath), -2,-1);
        END if;
        return mypath;

      end;
      $function$
  SQL
  create_function :function_insert_parent_comment_tree, sql_definition: <<-SQL
      CREATE OR REPLACE FUNCTION public.function_insert_parent_comment_tree(child_status_id bigint)
       RETURNS void
       LANGUAGE plpgsql
      AS $function$
      declare mypath varchar ;
      begin
       -- logic
      SELECT function_get_parent_comment_tree(child_status_id) into mypath;
              if mypath is not null then
                      insert into comment_trees(status_id, comment_path) VALUES (child_status_id, text2ltree(mypath));
              END if;
              EXCEPTION WHEN unique_violation then end;

      $function$
  SQL
  create_function :trigger_insert_comment_trees, sql_definition: <<-SQL
      CREATE OR REPLACE FUNCTION public.trigger_insert_comment_trees()
       RETURNS trigger
       LANGUAGE plpgsql
      AS $function$
      BEGIN
         IF NEW.reply THEN
         PERFORM function_insert_parent_comment_tree(NEW.id);
         return NEW;
         END IF;
         return NEW;
      END;
      $function$
  SQL
  create_function :function_update_parent_comment_tree, sql_definition: <<-SQL
      CREATE OR REPLACE FUNCTION public.function_update_parent_comment_tree(child_status_id bigint)
       RETURNS void
       LANGUAGE plpgsql
      AS $function$
      declare mypath varchar ;
      begin
       -- logic
      SELECT function_get_parent_comment_tree(child_status_id) into mypath;
              if mypath is not null then
                      update comment_trees set comment_path = text2ltree(mypath) where status_id = child_status_id;
              END if;
       
      end;
      $function$
  SQL
  create_function :account_weighted_tsv_trigger, sql_definition: <<-SQL
      CREATE OR REPLACE FUNCTION public.account_weighted_tsv_trigger()
       RETURNS trigger
       LANGUAGE plpgsql
      AS $function$
      begin
        new.weighted_tsv :=
           setweight(to_tsvector('simple', COALESCE(new.display_name,'')), 'A') ||
           setweight(to_tsvector('simple', COALESCE(new.username,'')), 'B');
        return new;
      end
      $function$
  SQL
  create_function :function_get_ancestor_statuses, sql_definition: <<-SQL
      CREATE OR REPLACE FUNCTION public.function_get_ancestor_statuses(child_status_id bigint)
       RETURNS ltree
       LANGUAGE plpgsql
      AS $function$
      declare mypath varchar ; begin
       -- logic
        WITH RECURSIVE cte AS(
          select id as Child, in_reply_to_id as Parent, id || ''  as Tree from statuses where id = child_status_id
          UNION ALL
          select id as Child, in_reply_to_id as Parent, Parent || '.' || Tree  as Tree from statuses s
          INNER JOIN cte c on c.Parent = s.id
        ) select * from cte into mypath;
        
        return mypath;

      end;
      $function$
  SQL
  create_function :function_get_all_comment_counts, sql_definition: <<-SQL
      CREATE OR REPLACE FUNCTION public.function_get_all_comment_counts(status_ids bigint[])
       RETURNS text
       LANGUAGE plpgsql
      AS $function$
      DECLARE
        status_id bigint; ids bigint[];
      BEGIN
        FOREACH status_id IN ARRAY status_ids
        LOOP
          select function_get_comment_count(status_id) into ids;
        END LOOP; return array_to_string(ids);
      END;
      $function$
  SQL
  create_function :function_get_full_comment_tree, sql_definition: <<-SQL
      CREATE OR REPLACE FUNCTION public.function_get_full_comment_tree(child_status_id bigint)
       RETURNS SETOF bigint
       LANGUAGE plpgsql
      AS $function$
      declare mypath varchar ;sid bigint ; begin
       -- logic
        WITH RECURSIVE cte AS(
          select id as Child, in_reply_to_id as Parent, id || ''  as Tree from statuses where id = child_status_id
          UNION ALL
          select id as Child, in_reply_to_id as Parent, Parent || ',' || Tree  as Tree from statuses s
          INNER JOIN cte c on c.Parent = s.id
        ) select cte.Parent || ',' || Tree as path from cte order by parent asc limit 1 into mypath;
        foreach sid in ARRAY(string_to_array(mypath, ',')) loop return next sid; end loop; 
      end;
      $function$
  SQL
  create_function :function_get_full_comment_counts, sql_definition: <<-SQL
      CREATE OR REPLACE FUNCTION public.function_get_full_comment_counts(child_status_id bigint)
       RETURNS SETOF bigint
       LANGUAGE plpgsql
      AS $function$
      declare mypath varchar;status_id bigint;count bigint; begin
       -- logic
        WITH RECURSIVE cte AS(
          select id as Child, in_reply_to_id as Parent, id || ''  as Tree from statuses where id = child_status_id
          UNION ALL
          select id as Child, in_reply_to_id as Parent, Parent || ',' || Tree  as Tree from statuses s
          INNER JOIN cte c on c.Parent = s.id
        ) select cte.Parent || ',' || Tree as path from cte order by parent asc limit 1 into mypath;
        if mypath is not null then foreach status_id in array string_to_array(mypath, ',') loop
          select function_get_comment_count(status_id) into count ;return next count;
        END LOOP; else return next 0; end if;
      end;
      $function$
  SQL
  create_function :function_get_comment_count, sql_definition: <<-SQL
      CREATE OR REPLACE FUNCTION public.function_get_comment_count(status_id bigint)
       RETURNS integer
       LANGUAGE plpgsql
      AS $function$
      declare mypath varchar ; begin
       -- logic
        with recursive comment_counter AS (
             select id, in_reply_to_id
             from statuses
             where in_reply_to_id = status_id
             union
             select s.id, c.in_reply_to_id
             from statuses s
             join comment_counter c on s.in_reply_to_id = c.id
           )
           select count(*)
           from comment_counter into mypath;
        return mypath;

      end;
      $function$
  SQL
  create_function :function_update_all_comment_counts, sql_definition: <<-SQL
      CREATE OR REPLACE FUNCTION public.function_update_all_comment_counts(status_ids bigint[])
       RETURNS void
       LANGUAGE plpgsql
      AS $function$
      DECLARE
        status_id bigint;
      BEGIN
        FOREACH status_id IN ARRAY status_ids
        LOOP
          update status_stats set replies_count = function_get_comment_count(status_id) where status_id = status_id ;
        END LOOP;
      END;
      $function$
  SQL
  create_function :trigger_sync_reply_counts, sql_definition: <<-SQL
      CREATE OR REPLACE FUNCTION public.trigger_sync_reply_counts()
       RETURNS trigger
       LANGUAGE plpgsql
      AS $function$
      BEGIN
         IF NEW.reply THEN
         PERFORM function_update_all_comment_counts(NEW.id);
         return NEW;
         END IF;
         return NEW;
      END;
      $function$
  SQL
  create_function :function_update_all_comment_counts, sql_definition: <<-SQL
      CREATE OR REPLACE FUNCTION public.function_update_all_comment_counts(child_status_id bigint)
       RETURNS void
       LANGUAGE plpgsql
      AS $function$
      DECLARE
        status_ids bigint[];sid bigint;
      BEGIN
        select string_to_array((ltree2text(function_get_parent_comment_tree(child_status_id))), '.') into status_ids;
      FOREACH sid IN ARRAY (status_ids)
        LOOP
          insert into status_stats as ss (status_id, replies_count, reblogs_count, favourites_count, created_at, updated_at) 
          VALUES (sid, function_get_comment_count(sid), 0, 0, now(), now())
          on conflict (status_id) do update set replies_count = EXCLUDED.replies_count, updated_at = EXCLUDED.updated_at where ss.replies_count != EXCLUDED.replies_count;
        END LOOP;
      END;
      $function$
  SQL


  create_trigger :update_account_tsvector, sql_definition: <<-SQL
      CREATE TRIGGER update_account_tsvector BEFORE INSERT OR UPDATE ON public.accounts FOR EACH ROW EXECUTE PROCEDURE account_weighted_tsv_trigger()
  SQL

  create_trigger :sync_reply_counts, sql_definition: <<-SQL
      CREATE TRIGGER sync_reply_counts AFTER INSERT OR DELETE ON public.statuses FOR EACH ROW EXECUTE PROCEDURE trigger_sync_reply_counts()
  SQL
end
