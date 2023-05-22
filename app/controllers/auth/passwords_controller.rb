# frozen_string_literal: true

class Auth::PasswordsController < Devise::PasswordsController
  before_action :check_validity_of_reset_password_token, only: :edit
  before_action :set_body_classes

  layout 'auth'

  def create
    if !resource_params[:email].present?
      flash[:alert] = 'Please enter your email address.'
      redirect_to '/auth/password/new'
      return
    end
    pwkey = "pwreset:#{Time.current.strftime('%Y%m%d%H')}:#{resource_params[:email]}"
    found = Rails.cache.read(pwkey)
    if found
      flash[:alert] = 'Too many password reset attempts. Please try again in an hour.'
      redirect_to '/auth/password/new'
    else
      Rails.cache.write(pwkey, 1, expires_in: 1.hour)
      super
    end
  end

  private

  def check_validity_of_reset_password_token
    unless reset_password_token_is_valid?
      flash[:error] = I18n.t('auth.invalid_reset_password_token')
      redirect_to new_password_path(resource_name)
    end
  end

  def set_body_classes
    @body_classes = ''
  end

  def reset_password_token_is_valid?
    resource_class.with_reset_password_token(params[:reset_password_token]).present?
  end
end
