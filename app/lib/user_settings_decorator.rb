# frozen_string_literal: true

class UserSettingsDecorator
  attr_reader :user, :settings

  def initialize(user)
    @user = user
  end

  def update(settings)
    @settings = settings
    process_update
  end

  private

  def process_update
    user.settings['notification_emails'] = merged_notification_emails if change?('notification_emails')
    user.settings['interactions']        = merged_interactions if change?('interactions')
    user.settings['default_status_expiration'] = default_status_expiration_preference if change?('setting_default_status_expiration')
    user.settings['default_privacy']     = default_privacy_preference if change?('setting_default_privacy')
    user.settings['default_sensitive']   = default_sensitive_preference if change?('setting_default_sensitive')
    user.settings['default_language']    = default_language_preference if change?('setting_default_language')
    user.settings['unfollow_modal']      = unfollow_modal_preference if change?('setting_unfollow_modal')
    user.settings['boost_modal']         = boost_modal_preference if change?('setting_boost_modal')
    user.settings['show_videos']         = show_videos_preference if change?('setting_show_videos')
    user.settings['show_suggested_users']  = show_suggested_users_preference if change?('setting_show_suggested_users')
    user.settings['show_groups']         = show_groups_preference if change?('setting_show_groups')
    user.settings['delete_modal']        = delete_modal_preference if change?('setting_delete_modal')
    user.settings['auto_play_gif']       = auto_play_gif_preference if change?('setting_auto_play_gif')
    user.settings['display_media']       = display_media_preference if change?('setting_display_media')
    user.settings['expand_spoilers']     = expand_spoilers_preference if change?('setting_expand_spoilers')
    user.settings['noindex']             = noindex_preference if change?('setting_noindex')
    user.settings['hide_network']        = hide_network_preference if change?('setting_hide_network')
    user.settings['pro_wants_ads']        = pro_wants_ads_preference if change?('setting_pro_wants_ads')
    user.settings['aggregate_reblogs']   = aggregate_reblogs_preference if change?('setting_aggregate_reblogs')
    user.settings['group_in_home_feed']  = group_in_home_feed_preference if change?('setting_group_in_home_feed')
    user.settings['show_pro_life']       = show_pro_life_preference if change?('setting_show_pro_life')
    user.settings['remote_rss_feed']     = Addressable::URI.parse(remote_rss_feed_entry).to_s if actually_changed?('setting_remote_rss_feed')
    user.settings['telegram_channel']    = Addressable::URI.parse(telegram_channel_entry).to_s if actually_changed?('setting_telegram_channel')
  end

  def merged_notification_emails
    user.settings['notification_emails'].merge coerced_settings('notification_emails').to_h
  end

  def merged_interactions
    user.settings['interactions'].merge coerced_settings('interactions').to_h
  end

  def default_status_expiration_preference
    settings['setting_default_status_expiration']
  end

  def default_privacy_preference
    settings['setting_default_privacy']
  end

  def default_sensitive_preference
    boolean_cast_setting 'setting_default_sensitive'
  end

  def unfollow_modal_preference
    boolean_cast_setting 'setting_unfollow_modal'
  end

  def boost_modal_preference
    boolean_cast_setting 'setting_boost_modal'
  end

  def show_videos_preference
    boolean_cast_setting 'setting_show_videos'
  end

  def show_voice_rooms_preference
    boolean_cast_setting 'setting_show_voice_rooms'
  end

  def show_suggested_users_preference
    boolean_cast_setting 'setting_show_suggested_users'
  end

  def show_groups_preference
    boolean_cast_setting 'setting_show_groups'
  end

  def delete_modal_preference
    boolean_cast_setting 'setting_delete_modal'
  end

  def auto_play_gif_preference
    boolean_cast_setting 'setting_auto_play_gif'
  end

  def display_media_preference
    settings['setting_display_media']
  end

  def expand_spoilers_preference
    boolean_cast_setting 'setting_expand_spoilers'
  end

  def noindex_preference
    boolean_cast_setting 'setting_noindex'
  end

  def remote_rss_feed_entry
    if user.account.vpdi? && settings['setting_remote_rss_feed'].starts_with?('http')
      settings['setting_remote_rss_feed'].downcase
    end
  end

  def telegram_channel_entry
    if user.account.vpdi? && settings['setting_telegram_channel'].starts_with?('http')
      settings['setting_telegram_channel'].downcase
    end
  end

  def hide_network_preference
    boolean_cast_setting 'setting_hide_network'
  end

  def pro_wants_ads_preference
    boolean_cast_setting 'setting_pro_wants_ads'
  end

  def default_language_preference
    settings['setting_default_language']
  end

  def aggregate_reblogs_preference
    boolean_cast_setting 'setting_aggregate_reblogs'
  end

  def group_in_home_feed_preference
    boolean_cast_setting 'setting_group_in_home_feed'
  end
  
  def show_pro_life_preference
    boolean_cast_setting 'setting_show_pro_life'
  end

  def boolean_cast_setting(key)
    ActiveModel::Type::Boolean.new.cast(settings[key])
  end

  def coerced_settings(key)
    coerce_values settings.fetch(key, {})
  end

  def coerce_values(params_hash)
    params_hash.transform_values { |x| ActiveModel::Type::Boolean.new.cast(x) }
  end

  def change?(key)
    !settings[key].nil?
  end

  def actually_changed?(key)
    settings[key] != user.settings[key]
  end
end
