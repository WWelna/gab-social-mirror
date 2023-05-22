# frozen_string_literal: true

class DeleteCommentService < BaseService
  include Redisable

  def call(comment)
    return if comment.nil?

    @comment = comment

    RedisLock.acquire(lock_options) do |lock|
      if lock.acquired?
        @comment.destroy!
      else
        raise GabSocial::RaceConditionError
      end
    end
  end

  def lock_options
    { redis: Redis.current, key: "distribute_comment:#{@comment.id}" }
  end
end
