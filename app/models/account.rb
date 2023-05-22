# frozen_string_literal: true
# == Schema Information
#
# Table name: accounts
#
#  id                      :bigint(8)        not null, primary key
#  username                :string           default(""), not null
#  domain                  :string
#  secret                  :string           default(""), not null
#  remote_url              :string           default(""), not null
#  salmon_url              :string           default(""), not null
#  hub_url                 :string           default(""), not null
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  note                    :text             default(""), not null
#  display_name            :string           default(""), not null
#  uri                     :string           default(""), not null
#  url                     :string
#  avatar_file_name        :string
#  avatar_content_type     :string
#  avatar_file_size        :integer
#  avatar_updated_at       :datetime
#  header_file_name        :string
#  header_content_type     :string
#  header_file_size        :integer
#  header_updated_at       :datetime
#  avatar_remote_url       :string
#  subscription_expires_at :datetime
#  locked                  :boolean          default(FALSE), not null
#  header_remote_url       :string           default(""), not null
#  last_webfingered_at     :datetime
#  inbox_url               :string           default(""), not null
#  outbox_url              :string           default(""), not null
#  shared_inbox_url        :string           default(""), not null
#  followers_url           :string           default(""), not null
#  protocol                :integer          default(0), not null
#  memorial                :boolean          default(FALSE), not null
#  moved_to_account_id     :bigint(8)
#  featured_collection_url :string
#  fields                  :jsonb
#  actor_type              :string
#  discoverable            :boolean
#  also_known_as           :string           is an Array
#  silenced_at             :datetime
#  suspended_at            :datetime
#  is_pro                  :boolean          default(FALSE), not null
#  pro_expires_at          :datetime
#  is_verified             :boolean          default(FALSE), not null
#  is_donor                :boolean          default(FALSE), not null
#  is_investor             :boolean          default(FALSE), not null
#  is_flagged_as_spam      :boolean          default(FALSE), not null
#  spam_flag               :integer
#  weighted_tsv            :tsvector
#  is_parody               :boolean
#

class Account < ApplicationRecord
  self.ignored_columns = ["private_key"]
  self.ignored_columns = ["public_key"]
  USERNAME_RE = /[a-z0-9_]+([a-z0-9_\.-]+[a-z0-9_]+)?/i
  MENTION_RE  = /(?<=^|[^\/[:word:]])@((#{USERNAME_RE})(?:@[a-z0-9\.\-]+[a-z0-9]+)?)/i
  MIN_FOLLOWERS_DISCOVERY = 10

  include AccountAssociations
  include AccountAvatar
  include AccountFinderConcern
  include AccountHeader
  include AccountInteractions
  include Attachmentable
  include Paginable
  include AccountCounters
  include DomainNormalizable

  SPAM_FLAG_CLASS_MAP = {
    none: nil,
    spam: 1,
    safe: 2,
  }.freeze

  validates :username, presence: true

  # Local user validations
  validates :username, format: { with: /\A[a-z0-9_]+\z/i }, length: { maximum: 30 }, if: -> { will_save_change_to_username? }
  validates_with UniqueUsernameValidator, if: -> { will_save_change_to_username? }
  validates_with UnreservedUsernameValidator, if: -> { will_save_change_to_username? }
  validates :display_name, length: { maximum: 30 }, if: -> { will_save_change_to_display_name? }
  validates :note, note_length: { maximum: 500 }, if: -> { will_save_change_to_note? }
  validates :fields, length: { maximum: 6 }, if: -> { will_save_change_to_fields? }

  scope :remote, -> { where('false') }
  scope :local, -> { }
  scope :partitioned, -> { order(Arel.sql('row_number() over (partition by domain)')) }
  scope :silenced, -> { where.not(silenced_at: nil) }
  scope :suspended, -> { where.not(suspended_at: nil) }
  scope :without_suspended, -> { where(suspended_at: nil) }
  scope :without_silenced, -> { where(silenced_at: nil) }
  scope :recent, -> { reorder(id: :desc) }
  scope :bots, -> { where(actor_type: %w(Application Service)) }
  scope :alphabetic, -> { order(domain: :asc, username: :asc) }
  scope :by_domain_accounts, -> { group(:id).select(:domain, 'COUNT(*) AS accounts_count').order('accounts_count desc') }
  scope :matches_username, ->(value) { matching(:username, :starts_with, value) }
  scope :matches_display_name, ->(value) { matching(:display_name, :starts_with, value) }
  scope :contains_display_name, ->(value) { matching(:display_name, :contains, value) }
  scope :matches_domain, ->(value) { matching(:domain, :contains, value) }
  scope :old_searchable, -> { without_suspended.where(moved_to_account_id: nil) }
  scope :discoverable, -> { old_searchable.without_silenced.where(discoverable: true).joins(:account_stat).where(AccountStat.arel_table[:followers_count].gteq(MIN_FOLLOWERS_DISCOVERY)) }
  scope :tagged_with, ->(tag) { joins(:accounts_tags).where(accounts_tags: { tag_id: tag }) }
  scope :by_recent_status, -> { order(Arel.sql('(case when account_stats.last_status_at is null then 1 else 0 end) asc, account_stats.last_status_at desc')) }
  scope :popular, -> { order('account_stats.followers_count desc') }

  delegate :email,
           :unconfirmed_email,
           :current_sign_in_ip,
           :current_sign_in_at,
           :confirmed?,
           :approved?,
           :admin?,
           :moderator?,
           :staff?,
           :locale,
           :hides_network?,
           to: :user,
           prefix: true,
           allow_nil: true

  delegate :chosen_languages, to: :user, prefix: false, allow_nil: true

  def cache_key
    "accounts/#{id}-#{updated_at.to_i}"
  end

  def local?
    true
  end

  def is_spam?
    spam_flag == SPAM_FLAG_CLASS_MAP[:spam]
  end

  def moved?
    moved_to_account_id.present?
  end

  def bot?
    %w(Application Service).include? actor_type
  end

  def vpdi?
    is_verified || is_pro || is_donor || is_investor?
  end

  def verified?
    is_verified
  end

  def has_running_marketplace_listings?
    marketplace_listings.only_running.any?
  end

  def is_pro_life?
    return false if pro_expires_at.nil?
    return false if !pro_expires_at.present?

    is_pro? && pro_expires_at > DateTime.now + 10.years
  end

  def show_pro_life?
    return true if is_pro_life? && user&.setting_show_pro_life
    false
  end

  alias bot bot?

  def bot=(val)
    self.actor_type = ActiveModel::Type::Boolean.new.cast(val) ? 'Service' : 'Person'
  end

  def acct
    username
  end

  def local_username_and_domain
    "#{username}@#{Rails.configuration.x.local_domain}"
  end

  def local_followers_count
    Follow.where(target_account_id: id).count
  end

  def local_following_count
    Follow.where(account_id: id).count
  end

  def unfollowing_count
    Unfollow.where(account_id: id).count
  end

  def chat_conversation_accounts_count
    ChatConversationAccount.where(account_id: id).count
  end

  def chat_messages_count
    ChatMessage.where(from_account_id: id).count
  end

  def silenced?
    silenced_at.present?
  end

  def silence!(date = nil)
    date ||= Time.now.utc
    update!(silenced_at: date)
  end

  def unsilence!
    update!(silenced_at: nil)
  end

  def suspended?
    suspended_at.present?
  end

  def suspend!(date = nil)
    date ||= Time.now.utc
    transaction do
      user&.disable!
      update!(suspended_at: date)
    end
  end

  def unsuspend!
    transaction do
      user&.enable!
      update!(suspended_at: nil)
    end
  end

  def memorialize!
    transaction do
      user&.disable!
      update!(memorial: true)
    end
  end

  def tags_as_strings=(tag_names)
    tag_names.map! { |name| name.mb_chars.downcase.to_s }
    tag_names.uniq!

    # Existing hashtags
    hashtags_map = Tag.where(name: tag_names).each_with_object({}) { |tag, h| h[tag.name] = tag }

    # Initialize not yet existing hashtags
    tag_names.each do |name|
      next if hashtags_map.key?(name)
      hashtags_map[name] = Tag.new(name: name)
    end

    # Remove hashtags that are to be deleted
    tags.each do |tag|
      if hashtags_map.key?(tag.name)
        hashtags_map.delete(tag.name)
      else
        transaction do
          tags.delete(tag)
          tag.decrement_count!(:accounts_count)
        end
      end
    end

    # Add hashtags that were so far missing
    hashtags_map.each_value do |tag|
      transaction do
        tags << tag
        tag.increment_count!(:accounts_count)
      end
    end
  end

  def fields
    (self[:fields] || []).map { |f| Field.new(self, f) }
  end

  def fields_attributes=(attributes)
    fields     = []
    old_fields = self[:fields] || []
    old_fields = [] if old_fields.is_a?(Hash)

    if attributes.is_a?(Hash)
      attributes.each_value do |attr|
        next if attr[:name].blank?

        previous = old_fields.find { |item| item['value'] == attr[:value] }

        if previous && previous['verified_at'].present?
          attr[:verified_at] = previous['verified_at']
        end

        fields << attr
      end
    end

    self[:fields] = fields
  end

  DEFAULT_FIELDS_SIZE = 6

  def build_fields
    return if fields.size >= DEFAULT_FIELDS_SIZE

    tmp = self[:fields] || []
    tmp = [] if tmp.is_a?(Hash)

    (DEFAULT_FIELDS_SIZE - tmp.size).times do
      tmp << { name: '', value: '' }
    end

    self.fields = tmp
  end

  def save_with_optional_media!
    save!
  rescue ActiveRecord::RecordInvalid
    self.avatar              = nil
    self.header              = nil
    save!
  end

  def object_type
    :person
  end

  def to_param
    username
  end

  def excluded_from_timeline_account_ids
    Rails.cache.fetch("exclude_account_ids_for:#{id}") { blocking.pluck(:target_account_id) + blocked_by.pluck(:account_id) + muting.pluck(:target_account_id) }
  end

  def excluded_from_timeline_domains
    Rails.cache.fetch("exclude_domains_for:#{id}") { domain_blocks.pluck(:domain) }
  end

  def preferred_inbox_url
    shared_inbox_url.presence || inbox_url
  end

  class Field < ActiveModelSerializers::Model
    attributes :name, :value, :verified_at, :account, :errors

    def initialize(account, attributes)
      @account     = account
      @attributes  = attributes
      @name        = attributes['name'].strip[0, string_limit]
      @value       = attributes['value'].strip[0, string_limit]
      @verified_at = attributes['verified_at']&.to_datetime
      @errors      = {}
    end

    def verified?
      verified_at.present?
    end

    def value_for_verification
      @value_for_verification ||= begin
        value
      end
    end

    def verifiable?
      value_for_verification.present? && value_for_verification.start_with?('http://', 'https://')
    end

    def mark_verified!
      @verified_at = Time.now.utc
      @attributes['verified_at'] = @verified_at
    end

    def to_h
      { name: @name, value: @value, verified_at: @verified_at }
    end

    private

    def string_limit
      255
    end
  end

  class << self
    def readonly_attributes
      super - %w(statuses_count following_count followers_count)
    end

    def domains
      reorder(nil).pluck(Arel.sql('distinct accounts.domain'))
    end

    def search_for(terms, limit = 10, offset = 0, options = {})
      textsearch, query = generate_query_for_search(terms)

      sql = <<-SQL.squish
        SELECT
          accounts.*,
          ts_rank_cd(#{textsearch}, #{query}, 32) AS rank
        FROM accounts
        WHERE #{query} @@ #{textsearch}
          AND accounts.suspended_at IS NULL
          AND accounts.moved_to_account_id IS NULL
          AND accounts.domain IS NULL
          #{'AND accounts.is_verified' if options[:onlyVerified]}
        ORDER BY accounts.is_verified DESC
        LIMIT ? OFFSET ?
      SQL

      records = find_by_sql([sql, limit, offset])
      ActiveRecord::Associations::Preloader.new.preload(records, :account_stat)
      records
    end

    def advanced_search_for(terms, account, limit = 10, offset = 0, options = {})
      textsearch, query = generate_query_for_search(terms)

      sql = <<-SQL.squish
        SELECT
          accounts.*,
          (count(f.id) + 1) * ts_rank_cd(#{textsearch}, #{query}, 32) AS rank,
          (count(f.id) + 1) AS fc,
          acs.followers_count
        FROM accounts
        LEFT OUTER JOIN follows AS f ON (accounts.id = f.account_id AND f.target_account_id = ?) OR (accounts.id = f.target_account_id AND f.account_id = ?)
        JOIN account_stats AS acs ON acs.account_id = accounts.id
        WHERE #{query} @@ #{textsearch}
          AND accounts.suspended_at IS NULL
          AND accounts.moved_to_account_id IS NULL
          AND accounts.domain IS NULL
          #{'AND accounts.is_verified' if options[:onlyVerified]}
        GROUP BY accounts.id, acs.followers_count
        ORDER BY accounts.is_verified DESC, followers_count DESC, rank DESC, rank DESC
        LIMIT ? OFFSET ?
      SQL

      records = find_by_sql([sql, account.id, account.id, limit, offset])

      ActiveRecord::Associations::Preloader.new.preload(records, :account_stat)
      records
    end

    private

    def generate_query_for_search(terms)
      terms      = Arel.sql(connection.quote(terms.gsub(/[^a-zA-Z0-9_.]/, ' ').strip))
      individual_terms = terms.split(/\s+/)

      terms_string = individual_terms.map { |t| "#{t}" }.join(" | ")

      if individual_terms.size == 1
        query      = "to_tsquery('simple', ''' ' || #{terms} || ' ''' || ':*')"
      else
        query      = "to_tsquery('simple', #{terms_string})"
      end
      ['accounts.weighted_tsv', query]
    end
  end

  def emojis
    @emojis ||= CustomEmoji.from_text(emojifiable_text)
  end

  before_validation :prepare_contents
  before_validation :prepare_username, on: :create

  private

  def prepare_contents
    display_name&.strip!
    note&.strip!
  end

  def prepare_username
    username&.squish!
  end

  def normalize_domain
    return
  end

  def emojifiable_text
    [note, display_name, fields.map(&:value)].join(' ')
  end

end
