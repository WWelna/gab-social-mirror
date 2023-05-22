# frozen_string_literal: true

class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  include Localized
  include Loggable

  helper_method :current_account
  helper_method :current_session
  helper_method :single_user_mode?
  helper_method :use_seamless_external_login?

  rescue_from ActionController::RoutingError, with: :not_found
  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from ActionController::InvalidAuthenticityToken, with: :unprocessable_entity
  rescue_from ActionController::UnknownFormat, with: :not_acceptable
  rescue_from GabSocial::NotPermittedError, with: :forbidden

  before_action :store_current_location, except: :raise_not_found, unless: :devise_controller?
  before_action :check_user_permissions, if: :user_signed_in?

  def raise_not_found
    raise ActionController::RoutingError, "No route matches #{params[:unmatched_route]}"
  end

  private

  def store_current_location
    store_location_for(:user, request.url) if request.format == :html
  end

  def require_admin!
    forbidden unless current_user&.admin?
  end

  def require_staff!
    forbidden unless current_user&.staff?
  end

  def check_user_permissions
    forbidden if current_user.disabled? || current_user.account.suspended?
  end

  def after_sign_out_path_for(_resource_or_scope)
    root_path
  end

  protected

  def truthy_param?(key)
    ActiveModel::Type::Boolean.new.cast(params[key])
  end

  def forbidden
    respond_with_error(403)
  end

  def not_found
    respond_with_error(404)
  end

  def gone
    respond_with_error(410)
  end

  def unprocessable_entity
    respond_with_error(422)
  end

  def not_acceptable
    respond_with_error(406)
  end

  def single_user_mode?
    @single_user_mode ||= Rails.configuration.x.single_user_mode && Account.exists?
  end

  def use_seamless_external_login?
    Devise.pam_authentication || Devise.ldap_authentication
  end

  def current_account
    @current_account ||= current_user.try(:account)
  end

  def current_session
    return nil if cookies.signed['_session_id'].nil?
    @current_session ||= Rails.cache.fetch("dk:sess:#{cookies.signed['_session_id']}", expires_in: 25.hours) do
      ActiveRecord::Base.connected_to(role: :writing) do
        SessionActivation.find_by(session_id: cookies.signed['_session_id'])
      end
    end
  end

  def cache_collection(raw, klass)
    return raw unless klass.respond_to?(:with_includes)

    raw = raw.cache_ids.to_a if raw.is_a?(ActiveRecord::Relation)
    return [] if raw.empty?

    cached_keys_with_value = Rails.cache.read_multi(*raw).transform_keys(&:id)
    uncached_ids           = raw.map(&:id) - cached_keys_with_value.keys

    # hit_count = cached_keys_with_value.length
    # ElasticAPM.set_label("cache_collection.#{klass.class}.hits", hit_count)

    klass.reload_stale_associations!(cached_keys_with_value.values) if klass.respond_to?(:reload_stale_associations!)

    unless uncached_ids.empty?
      records = klass.where(id: uncached_ids).with_includes
      uncached = records.index_by(&:id)
      cache_entries = records.index_by(&:cache_key)

      Rails.cache.write_multi(cache_entries)

      # miss_count = uncached_ids.length
      # ElasticAPM.set_label("cache_collection.#{klass.class}.misses", miss_count)
    end

    raw.map { |item| cached_keys_with_value[item.id] || uncached[item.id] }.compact
  end

  def respond_with_error(code)
    respond_to do |format|
      format.any  { head code }
      format.html { render "errors/#{code}", layout: 'error', status: code }
    end
  end


  def set_cache_headers
    response.headers['Vary'] = 'Accept'
  end

  def mark_cacheable!
    skip_session!
    expires_in 0, public: true
  end

  def skip_session!
    request.session_options[:skip] = true
  end
end
