# frozen_string_literal: true

class DeleteSessionActivationWorker
  include Sidekiq::Worker

  sidekiq_options lock: :until_executed, queue: 'pull', retry: 2

  def perform(session_activation_id)
    return if session_activation_id.nil?
    DeleteSessionActivationService.new.call(SessionActivation.find(session_activation_id))
  end
end
