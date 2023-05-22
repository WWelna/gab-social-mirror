# frozen_string_literal: true

class InitialStateSerializer < ActiveModel::Serializer
  attributes :meta, :compose, :accounts,
             :media_attachments, :settings

  has_one :push_subscription, serializer: REST::WebPushSubscriptionSerializer

  def meta
    store = {
      streaming_api_base_url: Rails.configuration.x.streaming_api_base_url,
      access_token: object.token,
      locale: I18n.locale,
      domain: Rails.configuration.x.local_domain,
      version: GabSocial::Version.to_s,
      report_categories: Report.categories.keys,
    }

    amount = 0
    Redis.current.with do |conn|
      amount = conn.get("monthly_funding_amount") || 0
    end
    amount = [amount.to_f, 100].min

    if object.current_account
      user = object.current_account.user
      all_settings = Setting.unscoped.where(thing_type: 'User', thing_id: user.id)      
      settings = {}
      all_settings.each do |setting|
        settings[setting.var] = setting.value
      end

      store[:username]           = object.current_account.username
      store[:me]                 = object.current_account.id.to_s
      store[:unfollow_modal]     = boolean_cast_setting(settings, 'unfollow_modal', true)
      store[:boost_modal]        = boolean_cast_setting(settings, 'boost_modal', false)
      store[:show_videos]        = boolean_cast_setting(settings, 'show_videos', true)
      store[:show_suggested_users]  = boolean_cast_setting(settings, 'show_suggested_users', true)
      store[:show_groups]        = boolean_cast_setting(settings, 'show_groups', true)
      store[:delete_modal]       = boolean_cast_setting(settings, 'delete_modal', true)
      store[:auto_play_gif]      = boolean_cast_setting(settings, 'auto_play_gif', true)
      store[:display_media]      = settings['display_media'] || 'default'
      store[:expand_spoilers]    = boolean_cast_setting(settings, 'expand_spoilers', false)
      store[:pro_wants_ads]      = boolean_cast_setting(settings, 'pro_wants_ads', false)
      store[:is_staff]           = user.staff?
      store[:unread_count]       = unread_count object.current_account
      store[:last_read_notification_id] = user.last_read_notification
      store[:is_first_session]   = is_first_session object.current_account
      store[:email_confirmed]    = user.confirmed?
      store[:email]              = user.confirmed? ? '[hidden]' : user.email
      store[:global_status_contexts] = StatusContext.serialized_enabled_global_status_contexts
      store[:active_reactions]   = ReactionType.serialized_active_reactions
      store[:all_reactions]      = ReactionType.serialized_all_reactions
      store[:new_unread_warnings_count] = new_unread_warnings_count(object.current_account) || 0
      store[:blocking] = object.current_account.blocking.pluck(:id)        
      store[:blocked_by] = object.current_account.blocked_by.pluck(:id)
      store[:muting] = object.current_account.muting.pluck(:id)
      store[:blocking_groups] = object.current_account.blocking_groups.pluck(:target_group_id)
      store[:filters] = object.current_account.custom_filters
      store[:expenses] = amount
    else
      store[:all_reactions]      = ReactionType.serialized_all_reactions
      store[:expenses] = amount
    end

    store
  end

  def compose
    store = {}

    if object.current_account
      store[:me]                = object.current_account.id.to_s
      store[:default_privacy]   = object.current_account.user.setting_default_privacy
      store[:default_sensitive] = object.current_account.user.setting_default_sensitive
      store[:default_status_expiration] = object.current_account.user.setting_default_status_expiration
    end

    store[:text] = object.text if object.text

    store
  end

  def accounts
    store = {}
    store[object.current_account.id.to_s] = ActiveModelSerializers::SerializableResource.new(object.current_account, serializer: REST::AccountSerializer) if object.current_account
    store
  end

  def media_attachments
    { accept_content_types: MediaAttachment.supported_file_extensions + MediaAttachment.supported_mime_types }
  end

  private

  def unread_count(account)
    account.unread_count
  end

  def instance_presenter
    @instance_presenter ||= InstancePresenter.new
  end

  def is_first_session(account)
    object.current_account.user.sign_in_count === 1
  end

  def boolean_cast_setting(settings, key, default)
    return default if settings[key].nil?
    ActiveModel::Type::Boolean.new.cast(settings[key])
  end

  def new_unread_warnings_count(account)
    count = AccountWarning
    .user_visible_warnings
    .not_dismissed
    .where(target_account: account)
    .count
  end
end
