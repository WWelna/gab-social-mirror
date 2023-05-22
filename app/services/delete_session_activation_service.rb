# frozen_string_literal: true

class DeleteSessionActivationService < BaseService
  include Redisable

  def call(session_activation)
    return if session_activation.nil?

    @session_activation = session_activation

    RedisLock.acquire(lock_options) do |lock|
      if lock.acquired?
        @session_activation.destroy!
      else
        raise GabSocial::RaceConditionError
      end
    end
  end

  def lock_options
    { redis: Redis.current, key: "distribute_session_activation:#{@session_activation.id}" }
  end
end
