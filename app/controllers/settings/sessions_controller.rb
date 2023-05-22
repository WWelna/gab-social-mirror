# frozen_string_literal: true

class Settings::SessionsController < Settings::BaseController
  before_action :authenticate_user!
  before_action :set_session, only: [:destroy]

  def destroy
    @session.destroy!
    Redis.current.publish("altstream:main", Oj.dump(event: :session_deactivation, payload: { session_id: params[:id] }))
    current_user.remember_me!
    flash[:notice] = I18n.t('sessions.revoke_success')
    redirect_to edit_user_registration_path
  end

  # remove sessions except the one we're currently logged into
  def all
    sid = current_session.id
    other_sessions = current_user.session_activations.where.not(id: sid)
    other_sessions.each do |session|
      Redis.current.publish("altstream:main", Oj.dump(event: :session_deactivation, payload: { session_id: session.id.to_s }))
    end
    other_sessions.destroy_all
    current_user.remember_me!
    flash[:notice] = I18n.t('sessions.revoke_success')
    redirect_to edit_user_registration_path
  end

  private

  def set_session
    @session = current_user.session_activations.find(params[:id])
  end
end
