# frozen_string_literal: true

class DeleteSessionActivationWorker
  include Sidekiq::Worker

  sidekiq_options unique: :until_executed

  def perform(session_activation_id)
    return if session_activation_id.nil?
    DeleteSessionActivationService.new.call(SessionActivation.find(session_activation_id))
  end
end
