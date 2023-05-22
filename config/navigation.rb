# frozen_string_literal: true

SimpleNavigation::Configuration.run do |navigation|
  navigation.items do |n|
    n.item :web, safe_join([fa_icon('chevron-left fw'), t('settings.back')]), root_url

    n.item :profile, safe_join([fa_icon('user fw'), t('settings.profile')]), settings_profile_url do |s|
      s.item :profile, safe_join([fa_icon('pencil fw'), t('settings.appearance')]), settings_profile_url, highlights_on: %r{/settings/profile|/settings/migration}
    end

    n.item :preferences, safe_join([fa_icon('cog fw'), t('settings.preferences')]), settings_preferences_url, highlights_on: %r{/settings/preferences|/settings/notifications}
    n.item :filters, safe_join([fa_icon('filter fw'), t('filters.index.title')]), settings_filters_path, highlights_on: %r{/filters}

    n.item :security, safe_join([fa_icon('lock fw'), t('settings.account')]), edit_user_registration_url do |s|
      s.item :password, safe_join([fa_icon('lock fw'), t('settings.account_settings')]), edit_user_registration_url, highlights_on: %r{/auth/edit|^/settings/delete$}
      s.item :two_factor_authentication, safe_join([fa_icon('mobile fw'), t('settings.two_factor_authentication')]), settings_two_factor_authentication_url, highlights_on: %r{/settings/two_factor_authentication}
      s.item :authorized_apps, safe_join([fa_icon('list fw'), t('settings.authorized_apps')]), oauth_authorized_applications_url
    end

    n.item :posts, safe_join([fa_icon('bars fw'), 'Statuses']), settings_statuses_url do |s|
      s.item :statuses, safe_join([fa_icon('calendar fw'), 'Statuses']), settings_statuses_url, highlights_on: %r{/settings/statuses|/settings/delete_statuses}
      s.item :scheduled_posts, safe_join([fa_icon('calendar fw'), 'Scheduled Statuses']), settings_scheduled_statuses_url
    end

    n.item :requests, safe_join([fa_icon('id-card-o fw'), t('verifications.requests.title')]), settings_verifications_requests_url

    n.item :export, safe_join([fa_icon('cloud-download fw'), t('settings.export')]), settings_export_url

    n.item :development, safe_join([fa_icon('code fw'), t('settings.development')]), settings_applications_url, if: -> { current_user.staff? }

    n.item :moderation, safe_join([fa_icon('gavel fw'), t('moderation.title')]), admin_reports_url, if: proc { current_user.staff? } do |s|
      s.item :accounts, safe_join([fa_icon('users fw'), t('admin.accounts.title')]), admin_accounts_url, highlights_on: %r{/admin/accounts|/admin/pending_accounts|admin/flagged_as_spam}
      s.item :statuses, safe_join([fa_icon('bars fw'), "Statuses"]), admin_statuses_url, if: -> { current_user.admin? }
      s.item :groups, safe_join([fa_icon('smile-o fw'), t('admin.groups.title')]), admin_groups_url, highlights_on: %r{/admin/groups}
      s.item :reports, safe_join([fa_icon('flag fw'), t('admin.reports.title')]), admin_reports_url, highlights_on: %r{/admin/reports}
      s.item :lists, safe_join([fa_icon('list fw'), 'Feeds']), admin_lists_url, highlights_on: %r{/admin/lists}
      # s.item :chat_messages, safe_join([fa_icon('comments fw'), "Chat Messages"]), admin_chat_messages_url, if: -> { current_user.admin? }
      s.item :preview_cards, safe_join([fa_icon('link fw'), "Preview Cards"]), admin_preview_cards_url
      s.item :action_logs, safe_join([fa_icon('bars fw'), t('admin.action_logs.title')]), admin_action_logs_url
      s.item :email_domain_blocks, safe_join([fa_icon('envelope fw'), t('admin.email_domain_blocks.title')]), admin_email_domain_blocks_url, highlights_on: %r{/admin/email_domain_blocks}, if: -> { current_user.admin? }
      s.item :link_blocks, safe_join([fa_icon('link fw'), t('admin.link_blocks.title')]), admin_link_blocks_url
      s.item :image_blocks, safe_join([fa_icon('link fw'), 'Image Blocks']), admin_image_blocks_url
      s.item :tombstones, safe_join([fa_icon('bars fw'), "Tombstones"]), admin_tombstones_url
      s.item :account_warnings, safe_join([fa_icon('link fw'), "Account Warnings"]), admin_account_warnings_url
      s.item :marketplace_listings, safe_join([fa_icon('id-card-o fw'), "Marketplace Listings"]), '/admin/marketplace_listings?status=0'
      s.item :comments, safe_join([fa_icon('bars fw'), "Comments"]), admin_comments_url
    end

    n.item :admin, safe_join([fa_icon('cogs fw'), t('admin.title')]), admin_dashboard_url, if: proc { current_user.staff? } do |s|
      s.item :dashboard, safe_join([fa_icon('tachometer fw'), t('admin.dashboard.title')]), admin_dashboard_url
      s.item :settings, safe_join([fa_icon('cogs fw'), t('admin.settings.title')]), edit_admin_settings_url, if: -> { current_user.admin? }, highlights_on: %r{/admin/settings}
      s.item :custom_emojis, safe_join([fa_icon('smile-o fw'), t('admin.custom_emojis.title')]), admin_custom_emojis_url, highlights_on: %r{/admin/custom_emojis}
      s.item :sidekiq, safe_join([fa_icon('diamond fw'), 'Sidekiq']), sidekiq_url, link_html: { target: 'sidekiq' }, if: -> { current_user.admin? }
      s.item :pghero, safe_join([fa_icon('database fw'), 'PgHero']), pghero_url, link_html: { target: 'pghero' }, if: -> { current_user.admin? }
      s.item :moderation, safe_join([fa_icon('id-card-o fw'), t('verifications.moderation.title')]), settings_verifications_moderation_url, if: -> { current_user.admin? }
      s.item :promotions, safe_join([fa_icon('star fw'), t('promotions.title')]), admin_promotions_url, if: -> { current_user.admin? }
      s.item :monthly_funding, safe_join([fa_icon('money fw'), t('monthly_funding.title')]), admin_expenses_url, if: -> { current_user.admin? }
      s.item :group_categories, safe_join([fa_icon('users fw'), t('group_categories.title')]), admin_group_categories_url, if: -> { current_user.admin? }
      s.item :marketplace_listing_categories, safe_join([fa_icon('bars fw'), 'Marketplace Categories']), admin_marketplace_listing_categories_url, if: -> { current_user.admin? }
      s.item :reaction_types, safe_join([fa_icon('thumbs-up fw'), 'Reaction Types']), admin_reaction_types_url, if: -> { current_user.admin? }
      s.item :status_contexts, safe_join([fa_icon('smile-o fw'), 'Contexts']), admin_status_contexts_url, if: -> { current_user.admin? }
    end

    n.item :logout, safe_join([fa_icon('sign-out fw'), t('auth.logout')]), destroy_user_session_url, link_html: { 'data-method' => 'delete' }
  end
end
