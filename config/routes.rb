# frozen_string_literal: true

require 'sidekiq/web'
require 'sidekiq-scheduler/web'

username_regex = /([^\/]*)/
html_only = lambda { |req| req.format.nil? || req.format.html? }

Rails.application.routes.draw do
  mount LetterOpenerWeb::Engine, at: 'letter_opener' if Rails.env.development?

  authenticate :user, lambda { |u| u.admin? } do
    mount Sidekiq::Web, at: 'sidekiq', as: :sidekiq
    mount PgHero::Engine, at: 'pghero', as: :pghero
  end

  SessionActivation.record_timestamps = false

  use_doorkeeper do
    controllers authorizations: 'oauth/authorizations',
                authorized_applications: 'oauth/authorized_applications',
                tokens: 'oauth/tokens'
  end

  get '.well-known/change-password', to: redirect('/auth/edit')

  get 'manifest', to: 'manifests#show', defaults: { format: 'json' }

  devise_scope :user do
    match '/auth/finish_signup' => 'auth/confirmations#finish_signup', via: [:get, :patch], as: :finish_signup
    match '/auth/sign_out' => 'auth/sessions#destroy', via: [:get, :delete]
  end

  devise_for :users, path: 'auth', controllers: {
    sessions:           'auth/sessions',
    registrations:      'auth/registrations',
    passwords:          'auth/passwords',
    confirmations:      'auth/confirmations',
  }

  get '/:username/avatar', to: 'account_assets#avatar'

  post '/settings/sessions/all', to: 'settings/sessions#all'

  namespace :settings do
    resource :profile, only: [:show, :update]
    resource :preferences, only: [:show, :update]
    resource :notifications, only: [:show, :update]

    namespace :billing do
      get :upgrade, to: 'upgrade#index', as: :upgrade
      get :transactions, to: 'transactions#index', as: :transactions
      post '/btcpay-notification', to: 'upgrade#btcpay_notification', as: :btcpay_notification
    end

    namespace :verifications do
      get :moderation, to: 'moderation#index', as: :moderation
      get 'moderation/:id/approve', to: 'moderation#approve', as: :approve
      get 'moderation/:id/reject', to: 'moderation#reject', as: :reject

      resources :requests, only: [:index, :create]
    end

    resource :export, only: [:show, :create]
    namespace :exports, constraints: { format: :csv } do
      resources :follows, only: :index, controller: :following_accounts
      resources :blocks, only: :index, controller: :blocked_accounts
      resources :mutes, only: :index, controller: :muted_accounts
      resources :lists, only: :index, controller: :lists
    end

    resource :two_factor_authentication, only: [:show, :create, :destroy]
    namespace :two_factor_authentication do
      resources :recovery_codes, only: [:create]
      resource :confirmation, only: [:new, :create]
    end

    resources :applications, except: [:edit] do
      member do
        post :regenerate
      end
    end

    resource :delete, only: [:show, :destroy]
    resource :delete_statuses, only: [:show, :destroy]

    resources :sessions, only: [:destroy]
    resources :statuses, only: [:index, :create]
    resources :scheduled_statuses, only: [:index, :destroy]
    resources :filters, except: [:show]
  end

  resources :media, only: [:show] do
    get :player
  end

  namespace :admin do
    get '/dashboard', to: 'dashboard#index'

    resources :email_domain_blocks, only: [:index, :new, :create, :destroy]
    resources :link_blocks, only: [:index, :new, :create, :destroy]
    resources :image_blocks, only: [:index, :new, :create, :destroy]
    resources :statuses, only: [:index, :show, :create, :update, :destroy]
    resources :preview_cards, only: [:index, :create, :destroy]
    resources :account_warnings, only: [:index]
    resources :tombstones, only: [:index, :create, :destroy]
    # resources :chat_messages, only: [:index, :destroy]
    resources :action_logs, only: [:index]
    resources :warning_presets, except: [:new]
    resource :settings, only: [:edit, :update]
    resources :promotions, only: [:index, :new, :create, :edit, :update, :destroy]
    resources :expenses, only: [:index, :new, :create, :edit, :update, :destroy]
    resources :group_categories, only: [:index, :new, :create, :edit, :update, :destroy]
    resources :marketplace_listing_categories, only: [:index, :new, :create, :show, :update, :destroy]
    resources :reaction_types, only: [:index, :new, :create, :show, :update]
    resources :lists, only: [:index, :show, :create, :edit, :update, :destroy]
    resources :comments, only: [:index, :show, :create, :edit, :update, :destroy]
    resources :status_contexts, only: [:index, :new, :create, :show, :update]

    resources :marketplace_listings, only: [:index, :show, :destroy] do
      member do
        post :approve
        post :request_revisions
        post :set_status
      end
    end

    resources :reports, only: [:index, :show] do
      member do
        post :assign_to_self
        post :unassign
        post :reopen
        post :resolve
      end

      resources :reported_statuses, only: [:create]
      resources :reported_links, only: [:create]
      resources :reported_images, only: [:create]
    end

    resources :report_notes, only: [:create, :destroy]

    resources :accounts, only: [:index, :show, :edit, :update] do
      member do
        post :enable
        post :unsilence
        post :unsuspend
        post :redownload
        post :remove_avatar
        post :remove_header
        post :memorialize
        post :approve
        post :reject
        post :verify
        post :unverify
        post :add_donor_badge
        post :remove_donor_badge
        post :add_investor_badge
        post :remove_investor_badge
        post :reset_spam
        post :spam
        post :reset_parody
        post :parody
        get :edit_pro
        put :save_pro
      end

      resource :change_email, only: [:show, :update]
      resource :reset, only: [:create]
      resource :action, only: [:new, :create], controller: 'account_actions'
      resources :account_statuses, only: [:index, :show, :create, :update, :destroy]
      resources :followers, only: [:index]
      resources :follows, only: [:index]
      resources :joined_groups, only: [:index]
      resources :chat_conversation_accounts, only: [:index]
      resources :chat_messages, only: [:index, :show, :create, :update, :destroy]
      resources :session_activations, only: [:index, :create]

      resource :confirmation, only: [:create] do
        collection do
          post :resend
        end
      end

      resource :role do
        member do
          post :promote
          post :demote
        end
      end
    end

    resources :users, only: [] do
      resource :two_factor_authentication, only: [:destroy]
    end

    resources :custom_emojis, only: [:index, :new, :create, :update, :destroy]

    resources :groups, only: [:index, :show, :update, :destroy] do
      member do
        post :make_me_admin
      end
    end

    resources :account_moderation_notes, only: [:create, :destroy]
  end

  namespace :api do
    # OEmbed
    get '/oembed', to: 'oembed#show', as: :oembed

    # Ads
    post '/ad_click', to: 'ads#click'
    post '/ad_view', to: 'ads#view'

    # Identity proofs
    get :proofs, to: 'proofs#index'

    # JSON / REST API
    namespace :v1 do
      get '/conversation_owner/:conversation_id', controller: :conversation_owner, action: :show
      post '/statuses/:id/remove', controller: :statuses, action: :remove
      resources :statuses, only: [:create, :update, :show, :destroy] do
        scope module: :statuses do
          resources :reblogged_by, controller: :reblogged_by_accounts, only: :index
          resources :favourited_by, controller: :favourited_by_accounts, only: :index
          resources :quotes, controller: :quotes, only: :index
          resource :reblog, only: :create
          post :unreblog, to: 'reblogs#destroy'
          get '/reactions', to: 'favourites#reactions'

          resource :favourite, only: :create
          post :unfavourite, to: 'favourites#destroy'

          resource :bookmark, only: [:show, :create]
          post :unbookmark, to: 'bookmarks#destroy'

          delete :mentions, to: 'mentions#destroy'

          resource :pin, only: [:show, :create]
          post :unpin, to: 'pins#destroy'

          resource :mute, only: [:show, :create]
          post :unmute, to: 'mutes#destroy'
        end

        member do
          get :comments
          get :context
          get :card
          get :revisions
        end
      end
    
      resources :comments, only: [:create, :update, :show, :destroy] do
        scope module: :comments do
          resources :reacted_by, controller: :reacted_by_accounts, only: :index

          resource :react, controller: :reactions, only: :create
          post :unreact, to: 'reactions#destroy'

          delete :mentions, to: 'mentions#destroy'

          resource :mute, only: [:show, :create]
          post :unmute, to: 'mutes#destroy'
        end

        member do
          # get :comments
          get :revisions
        end
      end

      resources :hmac_tokens, only: [:create]

      namespace :timelines do
        resource :home, only: :show, controller: :home
        resource :pro, only: :show, controller: :pro
        resources :tag, only: :show
        resources :list, only: :show
        resources :group, only: :show
        resources :group_collection, only: :show
        resources :group_pins, only: :show
        resources :preview_card, only: :show
        resource :explore, only: :show, controller: :explore
        resource :polls, only: :show
        resources :status_context, only: :show
      end

      namespace :comment_timelines do
        resources :tv, only: :show, controller: :tv
        resources :trends, only: :show, controller: :trends
      end

      namespace :chat_conversation_accounts do

      end

      resources :chat_conversation_accounts, only: :show do
        member do
          post :messenger_block_relationships
          post :block_messenger
          post :unblock_messenger
          post :mute_chat_conversation
          post :unmute_chat_conversation
          post :pin_chat_conversation
          post :unpin_chat_conversation
          post :leave_group_chat_conversation
        end
      end

      namespace :chat_conversations do
        resources :messages, only: :show do
          member do
            delete :destroy_all
          end
        end
        resources :approved_conversations, only: :index do
          collection do
            get :unread_count
            post :reset_all_unread_count
          end
        end
        resources :requested_conversations, only: :index do
          collection do
            get :count
          end
        end
        resources :blocked_chat_accounts, only: :index
        resources :muted_conversations, only: :index
        resources :search_conversations, only: :index
      end

      resources :chat_conversation, only: [:show, :create] do
        member do
          post :mark_chat_conversation_approved
          post :mark_chat_conversation_read
          post :mark_chat_conversation_hidden
          post :set_expiration_policy
        end
      end

      resources :links,         only: :show
      resources :hashtags,         only: :show
      resource :popular_links,  only: :show
      resources :streaming,     only: [:index]
      resources :custom_emojis, only: [:index]
      resources :suggestions,   only: [:index, :destroy]
      resources :scheduled_statuses, only: [:index, :show, :update, :destroy]
      resources :preferences,   only: [:index]
      resources :group_categories, only: [:index]
      resources :chat_messages, only: [:create, :destroy]
      resources :promotions,   only: [:index]
      resources :follows,      only: [:create]
      resources :media,        only: [:create, :update]
      resources :blocks,       only: [:index]
      resources :mutes,        only: [:index]
      resources :blockedby,    only: [:index]
      resources :favourites,   only: [:index]
      resources :reports,      only: [:create]
      resources :filters,      only: [:index, :create, :show, :update, :destroy]
      resources :albums,       only: [:create, :update, :show, :destroy]
      resources :album_lists,  only: [:show]
      resource :expenses,     only: [:show]
      resources :status_comments, only: [:show]
      resources :blocks_and_mutes, only: [:index]
      resources :marketplace_listing_categories, only: [:index]
      resources :marketplace_listing_search, only: [:index]
      resources :timeline_presets, only: [:index, :create, :show, :destroy]
      resources :marketplace_listing_browse, only: [:index]
      resources :marketplace_listing_saves, only: [:index]
      resources :status_stats, only: [:show]
      resources :status_flags, only: [:show]
      resources :comment_stats, only: [:show]
      resources :comment_flags, only: [:show]
      resource :status_contexts, only: [:show]

      resources :shortcuts, only: [:index, :create, :show, :destroy] do
        member do
          post :clear_count
        end
      end
      
      resources :warnings, only: [:index, :show, :destroy] do
        collection do
          get :new_unread_warnings_count
        end
        member do
          post :dismiss
        end
      end

      resources :bookmark_collections, only: [:index, :create, :show, :update, :destroy] do
        resources :bookmarks, only: [:index, :create], controller: 'bookmark_collections/bookmarks'
      end

      get '/account_by_username/:username', to: 'account_by_username#show', username: username_regex

      resources :follow_requests, only: [:index] do
        member do
          post :authorize
          post :reject
        end
      end

      resources :notifications, only: [:index, :show] do
        collection do
          post :clear
          post :mark_read
        end
      end

      namespace :accounts do
        get :verify_credentials, to: 'credentials#show'
        patch :update_credentials, to: 'credentials#update'
        post :resend_email_confirmation, to: 'credentials#resend_email_confirmation'
        resource :search, only: :show, controller: :search
        post :relationships, to: 'relationships#relationships'
      end

      resources :accounts, only: [:create, :show] do
        resources :statuses, only: :index, controller: 'accounts/statuses'
        resources :followers, only: :index, controller: 'accounts/follower_accounts'
        resources :following, only: :index, controller: 'accounts/following_accounts'
        resources :lists, only: :index, controller: 'accounts/lists'
        resources :marketplace_listings, only: :index, controller: 'accounts/marketplace_listings'
        resources :media_attachments, only: :index, controller: 'accounts/media_attachments'
        resources :comments, only: :index, controller: 'accounts/comments'

        member do
          post :follow
          post :unfollow
          post :block
          post :unblock
          post :mute
          post :unmute
        end
      end

      resources :lists, only: [:index, :create, :show, :update, :destroy] do
        resource :accounts, only: [:show, :create, :destroy], controller: 'lists/accounts' do
          member do
            delete :leave
          end
        end
        resource :subscribers, only: [:show, :create, :destroy], controller: 'lists/subscribers'
      end

      resources :groups, only: [:index, :create, :show, :update, :destroy, :block, :unblock] do
        member do
          delete '/statuses/:status_id', to: 'groups#destroy_status'
          post '/statuses/:status_id/approve', to: 'groups#approve_status'

          get '/member_search', to: 'groups#member_search'
          get '/removed_accounts_search', to: 'groups#removed_accounts_search'
        end

        post :block, to: 'groups#block'
        post :unblock, to: 'groups#unblock'

        get '/category/:category', to: 'groups#by_category'
        get '/tag/:tag', to: 'groups#by_tag'

        resource :accounts, only: [:show, :create, :update, :destroy], controller: 'groups/accounts'
        resource :removed_accounts, only: [:show, :create, :destroy], controller: 'groups/removed_accounts'
        resource :password, only: [:create], controller: 'groups/password'
        resource :join_requests, only: [:show], controller: 'groups/requests'
        resources :questions, only: [:index, :create, :update, :destroy], controller: 'groups/questions'
        resources :status_contexts, only: [:index, :show, :create, :update, :destroy], controller: 'groups/status_contexts'
        resource :rules, only: [:create, :destroy], controller: 'groups/rules'

        post '/join_requests/respond', to: 'groups/requests#respond_to_request'
        
        resource :moderation, controller: 'groups/moderation'
        post '/moderation/approve_post', to: 'groups/moderation#approve_post'
        post '/moderation/remove_post', to: 'groups/moderation#remove_post'
        post '/moderation/approve_user', to: 'groups/moderation#approve_user'
        post '/moderation/remove_user', to: 'groups/moderation#remove_user'
        post '/moderation/report_user', to: 'groups/moderation#report_user'
        get '/moderation/stats', to: 'groups/moderation#stats'
        get '/moderation/my_stats', to: 'groups/moderation#my_stats'

        resource :pin, only: [:show, :create], controller: 'groups/pins'
        post :unpin, to: 'groups/pins#destroy'

        resources :account_badges, only: [:index, :show, :create, :update, :destroy], controller: 'groups/account_badges' do
          member do
            post '/assign_badge', to: 'groups/account_badges#assign_badge'
            post '/unassign_badge', to: 'groups/account_badges#unassign_badge'
          end
        end
        
        get '/insights/member_growth',   to: 'groups/insights#member_growth'
        get '/insights/post_engagement', to: 'groups/insights#post_engagement'
        get '/insights/popular_days',    to: 'groups/insights#popular_days'
        get '/insights/popular_times',   to: 'groups/insights#popular_times'
        get '/insights/top_members',     to: 'groups/insights#top_members'
        get '/insights/removed_members', to: 'groups/insights#removed_members'

        post '/question_answers/answer_all', to: 'groups/question_answers#answer_all'
        post '/question_answers/account_answers', to: 'groups/question_answers#account_answers'
  
      end

      resources :marketplace_listings, only: [:show, :create, :update, :destroy] do
        member do
          post :set_status
        end

        resource :buyers, only: [:show], controller: 'marketplace_listings/buyers'
        resource :status_changes, only: [:show], controller: 'marketplace_listings/status_changes'
        resource :saves, only: [:show, :create, :destroy], controller: 'marketplace_listings/saves'
      end

      post :group_relationships, to: 'group_relationships#relationships'
      post :list_relationships, to: 'list_relationships#relationships'

      resources :polls, only: [:create, :show] do
        resources :votes, only: :create, controller: 'polls/votes'
      end

      namespace :push do
        resource :subscription, only: [:create, :show, :update, :destroy]
      end
    end

    namespace :v2 do
      get '/search', to: 'search#index', as: :search
      resources :lists, only: [:index]
    end

    namespace :v3 do
      get '/search', to: 'search#index', as: :search_v3
      get '/me', to: 'me#index', as: :me
      post '/authcode', to: 'authcode#create', as: :authcode
      get '/voice', to: 'voice#index'
      post '/telegram', to: 'telegram#create', as: :telegram
    end

    namespace :web do
      resource :settings, only: [:update]
      resource :chat_settings, only: [:update]
      resource :embed, only: [:create]
      resources :push_subscriptions, only: [:create] do
        member do
          put :update
        end
      end
    end
  end

  get '/g/:groupSlug', to: 'react#groupBySlug'
  get '/feed/:listSlug', to: 'react#feedBySlug'

  get '/:username/posts/:statusId', to: 'react#status_show', username: username_regex
  get '/:username/posts/:statusId', to: 'react#status_show', username: username_regex, as: :short_account_status
  # get '/:username/posts/:statusId/embed', to: 'react#status_embed', username: username_regex, as: :embed_short_account_status

  get '/(*any)', to: 'react#react', as: :web
  get '/:username', to: 'react#account_show', username: username_regex, as: :short_account_with_replies
  root 'react#react'

  get '/groups/:groupId', to: 'react#group_show', as: :group_show_page

  get '/', to: 'react#react', as: :homepage

  get '/about', to: 'react#react'
  get '/about/tos', to: 'react#react'
  get '/about/privacy', to: 'react#react'
  get '/about/investors', to: 'react#react'
  get '/about/dmca', to: 'react#react'
  get '/about/sales', to: 'react#react'

  match '*unmatched_route',
        via: :all,
        to: 'application#raise_not_found',
        format: false
end
