# frozen_string_literal: true

class Web::NotificationSerializer < ActiveModel::Serializer
  include RoutingHelper
  include ActionView::Helpers::TextHelper
  include ActionView::Helpers::SanitizeHelper

  attributes :access_token, :preferred_locale, :notification_id,
             :notification_type, :icon, :title, :body,
             :group_id, :group_name, :approved, :rejected, :removed, :target_url

  def access_token
    current_push_subscription.associated_access_token
  end

  def preferred_locale
    current_push_subscription.associated_user&.locale || I18n.default_locale
  end

  def notification_id
    object.id
  end

  def notification_type
    object.type
  end

  def icon
    full_asset_url(object.from_account.avatar_static_url, cloudflare_options: { width: 68, fit: 'scale-down' })
  end

  def body #title
    I18n.t("notification_mailer.#{object.type}.subject", name: object.from_account.display_name.presence || object.from_account.username)
  end

  def title #body
    ""
    #str = strip_tags(object.target_status&.spoiler_text&.presence || object.target_status&.text || object.from_account.note)
    #truncate(HTMLEntities.new.decode(str.to_str), length: 140) # Do not encode entities, since this value will not be used in HTML
  end

  def target_url
    if object.target_status
      "https://#{ENV['LOCAL_DOMAIN']}#{object.target_status&.uri}"
    else
      "https://#{ENV['LOCAL_DOMAIN']}/notifications"
    end
  end
end
