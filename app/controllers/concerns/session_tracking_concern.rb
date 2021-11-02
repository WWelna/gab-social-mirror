# frozen_string_literal: true

module SessionTrackingConcern
  extend ActiveSupport::Concern

  UPDATE_SIGN_IN_HOURS = 24

  included do
    before_action :set_session_activity
  end

  private

  def set_session_activity
    return unless session_needs_update?
    ActiveRecord::Base.connected_to(role: :writing) do
      conn = ActiveRecord::Base.connection
      conn.exec_query "update session_activations set updated_at = NOW() where id = #{current_session.id}"
    end
    @session_activity_tracked = true
  end

  def session_needs_update?
    !@session_activity_tracked && !current_session.nil? && current_session.updated_at > UPDATE_SIGN_IN_HOURS.hours.ago
  end
end
