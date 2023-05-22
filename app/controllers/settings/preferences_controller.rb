# frozen_string_literal: true

class Settings::PreferencesController < Settings::BaseController
  layout 'admin'

  before_action :authenticate_user!

  def show; end

  def update
    user_settings.update(user_settings_params.to_h)
    # current_user.force_regeneration!

    if current_user.update(user_params)
      I18n.locale = current_user.locale
      redirect_to settings_preferences_path, notice: I18n.t('generic.changes_saved_msg')
    else
      render :show
    end
  end

  private

  def user_settings
    UserSettingsDecorator.new(current_user)
  end

  def user_params
    params.require(:user).permit(
      :locale,
      chosen_languages: []
    )
  end

  def user_settings_params
    params.require(:user).permit(
      :setting_default_status_expiration,
      :setting_default_privacy,
      :setting_default_sensitive,
      :setting_default_language,
      :setting_unfollow_modal,
      :setting_boost_modal,
      :setting_show_videos,
      :setting_show_voice_rooms,
      :setting_show_suggested_users,
      :setting_show_groups,
      :setting_delete_modal,
      :setting_auto_play_gif,
      :setting_display_media,
      :setting_expand_spoilers,
      :setting_noindex,
      :setting_hide_network,
      :setting_aggregate_reblogs,
      :setting_group_in_home_feed,
      :setting_pro_wants_ads,
      :setting_show_pro_life,
      :setting_remote_rss_feed,
      :setting_telegram_channel,
      notification_emails: %i(follow follow_request reblog favourite mention digest report pro_reminder emails_from_gabcom),
      interactions: %i(must_be_follower must_be_following)
    )
  end
end
