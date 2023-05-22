# frozen_string_literal: true

class Form::SessionActivationBatch
  include ActiveModel::Model
  include AccountableConcern

  attr_accessor :session_activation_ids, :action, :current_account

  def save
    case action
    when 'revoke'
      revoke_session_activations
    end
  end

  private

  def revoke_session_activations
    SessionActivation.where(id: session_activation_ids).reorder(nil).find_each do |session|
      DeleteSessionActivationWorker.perform_async(session.id)
      log_action :destroy, session
    end

    true
  end
end
