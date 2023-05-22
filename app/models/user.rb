# frozen_string_literal: true
# == Schema Information
#
# Table name: users
#
#  id                        :bigint(8)        not null, primary key
#  email                     :string           default(""), not null
#  created_at                :datetime         not null
#  updated_at                :datetime         not null
#  encrypted_password        :string           default(""), not null
#  reset_password_token      :string
#  reset_password_sent_at    :datetime
#  remember_created_at       :datetime
#  sign_in_count             :integer          default(0), not null
#  current_sign_in_at        :datetime
#  last_sign_in_at           :datetime
#  current_sign_in_ip        :inet
#  last_sign_in_ip           :inet
#  admin                     :boolean          default(FALSE), not null
#  confirmation_token        :string
#  confirmed_at              :datetime
#  confirmation_sent_at      :datetime
#  unconfirmed_email         :string
#  locale                    :string
#  encrypted_otp_secret      :string
#  encrypted_otp_secret_iv   :string
#  encrypted_otp_secret_salt :string
#  consumed_timestep         :integer
#  otp_required_for_login    :boolean          default(FALSE), not null
#  last_emailed_at           :datetime
#  otp_backup_codes          :string           is an Array
#  filtered_languages        :string           default([]), not null, is an Array
#  account_id                :bigint(8)        not null
#  disabled                  :boolean          default(FALSE), not null
#  moderator                 :boolean          default(FALSE), not null
#  remember_token            :string
#  chosen_languages          :string           is an Array
#  created_by_application_id :bigint(8)
#  approved                  :boolean          default(TRUE), not null
#  last_read_notification    :bigint(8)
#  unique_email              :string
#

class User < ApplicationRecord
  self.ignored_columns = ["{:column=>:invite}_id"]

  include Settings::Extend
  include UserRoles

  devise :two_factor_authenticatable,
         otp_secret_encryption_key: Rails.configuration.x.otp_secret

  devise :two_factor_backupable,
         otp_number_of_backup_codes: 10

  devise :registerable, :recoverable, :rememberable, :trackable, :validatable,
         :confirmable

  include Omniauthable
  include PamAuthenticable
  include LdapAuthenticable

  belongs_to :account, inverse_of: :user
  belongs_to :created_by_application, class_name: 'Doorkeeper::Application', optional: true
  accepts_nested_attributes_for :account

  has_many :applications, class_name: 'Doorkeeper::Application', as: :owner
  has_many :backups, inverse_of: :user

  validates :locale, inclusion: I18n.available_locales.map(&:to_s), if: :locale?
  validates_with BlacklistedEmailValidator, on: :create
  validates_with BlacklistedEmailValidator, on: :update, if: :email_changed?
  validates_with EmailMxValidator, if: :validate_email_dns?
  validates :agreement, acceptance: { allow_nil: false, accept: [true, 'true', '1'] }, on: :create

  # The built in Devise validator is a simple uniqueness validator that doesn't take Gmail's
  # `.` or `+` syntax into account.
  self.validators_on(:email).
    detect { |v| v.is_a?(ActiveRecord::Validations::UniquenessValidator) }.
    attributes.
    delete(:email)
  validates_with EmailUniquenessValidator, if: :email_changed?

  scope :recent, -> { order(id: :desc) }
  scope :approved, -> { where(approved: true) }
  scope :confirmed, -> { where.not(confirmed_at: nil) }
  scope :enabled, -> { where(disabled: false) }
  scope :matches_email, ->(value) { matching(:email, :contains, value) }
  scope :emailable, -> { confirmed.enabled.joins(:account).merge(Account.old_searchable) }

  before_validation :sanitize_languages
  before_create :set_approved
  after_create :prepare_new_user!

  # This avoids a deprecation warning from Rails 5.1
  # It seems possible that a future release of devise-two-factor will
  # handle this itself, and this can be removed from our User class.
  attribute :otp_secret

  has_many :session_activations, dependent: :destroy

  delegate :auto_play_gif, :default_sensitive, :unfollow_modal, :boost_modal, :delete_modal, 
           :show_videos, :show_voice_rooms, :show_suggested_users, :show_groups, :default_status_expiration,
           :noindex, :display_media, :hide_network, :pro_wants_ads,
           :expand_spoilers, :default_language, :aggregate_reblogs, :show_pro_life, :remote_rss_feed, :telegram_channel,
           :group_in_home_feed, to: :settings, prefix: :setting, allow_nil: false

  attr_writer :external

  def email=(email_address)
    self[:unique_email] = EmailAddress::Address.new(email_address).canonical
    self[:email] = email_address
    super
  end

  def cache_key
    "user/#{username}-#{cache_version}"
  end

  def confirmed?
    confirmed_at.present?
  end

  def disable!
    update!(disabled: true,
            last_sign_in_at: current_sign_in_at,
            current_sign_in_at: nil)
  end

  def enable!
    update!(disabled: false)
  end

  def confirm
    ActiveRecord::Base.connected_to(role: :writing) do
      new_user = !confirmed?
      self.approved = true if open_registrations?

      super

      if new_user && approved?
        # prepare_new_user!
      end
    end
  end

  def confirm!
    new_user = !confirmed?
    self.approved = true if open_registrations?

    skip_confirmation!
    save!

    # prepare_new_user! if new_user && approved?
  end

  def active_for_authentication?
    super && approved?
  end

  def approve!
    return if approved?

    update!(approved: true)
    # prepare_new_user!
  end

  def update_tracked_fields!(request)
    ActiveRecord::Base.connected_to(role: :writing) do
      super
      prepare_returning_user!
    end
  end

  def update_sign_in!(request, new_sign_in: false)
    ActiveRecord::Base.connected_to(role: :writing) do
      old_current, new_current = current_sign_in_at, Time.now.utc
      self.last_sign_in_at     = old_current || new_current
      self.current_sign_in_at  = new_current

      old_current = current_sign_in_ip
      new_current = request.remote_ip
      self.last_sign_in_ip     = old_current || new_current
      self.current_sign_in_ip  = new_current

      if new_sign_in
        self.sign_in_count ||= 0
        self.sign_in_count  += 1
      end

      save(validate: false) unless new_record?
      prepare_returning_user!
    end
  end

  def disable_two_factor!
    self.otp_required_for_login = false
    otp_backup_codes&.clear
    save!
  end

  def setting_default_privacy
    settings.default_privacy || (account.locked? ? 'private' : 'public')
  end

  def allows_digest_emails?
    settings.notification_emails['digest']
  end

  def allows_report_emails?
    settings.notification_emails['report']
  end

  def allows_pro_reminder_emails?
    settings.notification_emails['pro_reminder']
  end

  def hides_network?
    @hides_network ||= settings.hide_network
  end

  def pro_wants_ads?
    @pro_wants_ads ||= settings.pro_wants_ads
  end

  def aggregates_reblogs?
    @aggregates_reblogs ||= settings.aggregate_reblogs
  end

  def allows_group_in_home_feed?
    settings.group_in_home_feed
  end

  def token_for_app(a)
    return nil if a.nil? || a.owner != self
    ActiveRecord::Base.connected_to(role: :writing) do
      Doorkeeper::AccessToken
        .find_or_create_by(application_id: a.id, resource_owner_id: id) do |t|

        t.scopes = a.scopes
        t.expires_in = Doorkeeper.configuration.access_token_expires_in
        t.use_refresh_token = Doorkeeper.configuration.refresh_token_enabled?
      end
    end
  end

  def activate_session(request)
    session_activations.activate(session_id: SecureRandom.hex,
                                 user_agent: request.user_agent,
                                 ip: request.remote_ip).session_id
  end

  def exclusive_session(id)
    session_activations.exclusive(id)
  end

  def session_active?(id)
    session_activations.active? id
  end

  def web_push_subscription(session)
    return nil if session.nil?
    session.web_push_subscription.nil? ? nil : session.web_push_subscription
  end

  def challenge
    #
  end

  def password_required?
    return false if Devise.pam_authentication || Devise.ldap_authentication
    super
  end

  def send_reset_password_instructions
    return false if encrypted_password.blank? && (Devise.pam_authentication || Devise.ldap_authentication)
    super
  end

  def reset_password!(new_password, new_password_confirmation)
    return false if encrypted_password.blank? && (Devise.pam_authentication || Devise.ldap_authentication)
    super
  end

  def show_all_media?
    setting_display_media == 'show_all'
  end

  def hide_all_media?
    setting_display_media == 'hide_all'
  end

  def force_regeneration!
    # Redis.current.set("account:#{account_id}:regeneration", true)
  end

  def all_settings
    all = Setting.unscoped.where(thing_type: 'User', thing_id: id)
  end

  protected

  def send_devise_notification(notification, *args)
    devise_mailer.send(notification, self, *args).deliver_later
  end

  private

  def set_approved
    self.approved = open_registrations?
  end

  def external?
    !!@external
  end

  def sanitize_languages
    return if chosen_languages.nil?
    chosen_languages.reject!(&:blank?)
    self.chosen_languages = nil if chosen_languages.empty?
  end

  def prepare_new_user!
    BootstrapTimelineWorker.perform_async(account_id)
    ActivityTracker.increment('activity:accounts:local')
    UserMailer.welcome(self).deliver_later
  end

  def prepare_returning_user!
    ActivityTracker.record('activity:logins', id)
  end

  def validate_email_dns?
    email_changed? && !(Rails.env.test? || Rails.env.development?)
  end

  # allow username or email address for login (Gab)
  def self.find_for_database_authentication conditions
    if conditions[:email].start_with? "@" or !conditions[:email].include? "@"
      joins(:account).find_by(accounts: { domain: nil, username: conditions[:email].sub('@', '') })
    else
      super
    end
  end

  def open_registrations?
    Setting.registrations_mode == 'open'
  end

end
