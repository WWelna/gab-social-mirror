# frozen_string_literal: true

class Api::BaseController < ApplicationController
  DEFAULT_STATUSES_LIMIT = 20
  DEFAULT_COMMENTS_LIMIT = 10
  DEFAULT_ACCOUNTS_LIMIT = 20
  DEFAULT_MEDIA_ATTACHMENTS_LIMIT = 10
  DEFAULT_ACCOUNT_WARNINGS_LIMIT = 20
  DEFAULT_CHAT_CONVERSATION_LIMIT = 20
  DEFAULT_CHAT_CONVERSATION_MESSAGE_LIMIT = 20
  DEFAULT_GROUP_CHAT_CONVERSATION_PARTICIPANT_LIMIT = 50
  DEFAULT_MARKETPLACE_LISTINGS_LIMIT = 24
  MAX_LIMIT_PARAM = 25
  MIN_UNAUTHENTICATED_PAGES = 1
  MAX_MARKETPLACE_LISTING_RUNTIME_DAYS = 30

  skip_before_action :store_current_location
  skip_before_action :check_user_permissions

  before_action :block_if_doorkeeper
  before_action :set_cache_headers

  protect_from_forgery with: :null_session

  skip_around_action :set_locale

  rescue_from ActiveRecord::RecordInvalid, GabSocial::ValidationError do |e|
    render json: { error: e.to_s }, status: 422
  end

  rescue_from ActiveRecord::RecordNotFound do
    render json: { error: 'Record not found' }, status: 404
  end

  rescue_from HTTP::Error, GabSocial::UnexpectedResponseError do
    render json: { error: 'Remote data could not be fetched' }, status: 503
  end

  rescue_from OpenSSL::SSL::SSLError do
    render json: { error: 'Remote SSL certificate could not be verified' }, status: 503
  end

  rescue_from GabSocial::NotPermittedError do |e|
    render json: { error: e.to_s }, status: 403
  end

  def doorkeeper_unauthorized_render_options(error: nil)
    { json: { error: (error.try(:description) || 'Not authorized') } }
  end

  def doorkeeper_forbidden_render_options(*)
    { json: { error: 'This action is outside the authorized scopes' } }
  end

  protected

  def set_pagination_headers(next_path = nil, prev_path = nil)
    links = []
    links << [next_path, [%w(rel next)]] if next_path
    links << [prev_path, [%w(rel prev)]] if prev_path
    response.headers['Link'] = LinkHeader.new(links) unless links.empty?
  end

  def limit_param(default_limit)
    return default_limit unless params[:limit]
    [params[:limit].to_i.abs, MAX_LIMIT_PARAM].min
  end

  def params_slice(*keys)
    params.slice(*keys).permit(*keys)
  end

  def doorkeeper_token
    return @doorkeeper_token if defined?(@doorkeeper_token)

    bearer_token = Doorkeeper::OAuth::Token.from_bearer_authorization(request)

    # If there's no bearer token header, there's no token
    return @doorkeeper_token = nil unless bearer_token

    # Connect to the master when reading, so we find tokens that aren't yet in the slaves
    @doorkeeper_token = DoorkeeperTokenCache.fetch(bearer_token) do
      ActiveRecord::Base.connected_to(role: :writing) do
        super
      end
    end
  end

  def current_resource_owner
    ActiveRecord::Base.connected_to(role: :writing) do
      if doorkeeper_token
        @current_user ||= User.find(doorkeeper_token.resource_owner_id)
      end
    end
    return @current_user
  end

  def current_user
    user_if_trustworthy(current_resource_owner || super)
  rescue ActiveRecord::RecordNotFound
    nil
  end

  def require_user!
    if !current_user
      render json: { error: 'This method requires an authenticated user' }, status: 422
    elsif current_user.disabled?
      render json: { error: 'Your login is currently disabled' }, status: 403
    # : todo : when figure out email/catpcha, put this back
    # elsif !current_user.confirmed?
    #   render json: { error: 'Your login is missing a confirmed e-mail address' }, status: 403
    elsif !current_user.account.nil? and current_user.account.is_spam?
      render json: { error: 'Your account has been flagged as spam. Please contact support@gab.com if you believe this is an error.' }, status: 403
    elsif !current_user.approved?
      render json: { error: 'Your login is currently pending approval' }, status: 403
    end
  end

  def render_empty_success(message = nil)
    render json: { success: true, error: false, message: message }, status: 200
  end

  def authorize_if_got_token!(*scopes)
    doorkeeper_authorize!(*scopes) if doorkeeper_token
  end

  # Ensure that the Bearer token wasn't stolen
  def user_if_trustworthy(user)
    # Not logged in, don't worry about it.
    return nil unless user

    # Only enable this protection for StatusesController#create for now, while we work to add
    # HMAC to HYDRA services.
    return user unless controller_name == 'statuses' && action_name == 'create'

    # Validate CSRF token with a Devise cookie
    # Ensuring that the current session's User ID from your Devise cookie matches the ID from your
    # Doorkeeper token. If you submit the wrong CSRF token, you'll get a new cookie jar and
    # therefore won't have a `cookies.signed['_session_id']` set, because of
    # `protect_from_forgery with: :null_session`, which means there won't be a `current_session`.
    return user if (id = current_session&.user_id) && user.id == id

    # HYDRA uses a HMAC Token to verify requests
    return user if ValidateHmacRequestService.new.call(
                     id: doorkeeper_token&.application_id,
                     hmac: request.headers['X-Gab-Hmac'],
                     url: request.url,
                     body: request.raw_post
                   )

    # Something fishy is going on...
    log_request(:error, 'REQUEST NOT VERIFIED')
    return user if user
    return nil
  end

  def superapp?
    return true if doorkeeper_token.nil?
    doorkeeper_token && doorkeeper_token.application.superapp? || false
  end

  def block_if_doorkeeper
    raise GabSocial::NotPermittedError, 'Unauthorized app' unless superapp?
  end

  def set_cache_headers
    response.headers['Cache-Control'] = 'private, max-age=10'
  end
end
