# frozen_string_literal: true

class PotentialFriendshipTracker
  EXPIRE_AFTER = 90.days.seconds
  MAX_ITEMS    = 80

  WEIGHTS = {
    reply: 1,
    favourite: 10,
    reblog: 20,
  }.freeze

  class << self
    include Redisable

    def record(account_id, target_account_id, action)
      return if account_id == target_account_id

      key    = "interactions:#{account_id}"
      weight = WEIGHTS[action]

      redis.with do |conn|
        conn.zincrby(key, weight, target_account_id)
        conn.zremrangebyrank(key, 0, -MAX_ITEMS)
        conn.expire(key, EXPIRE_AFTER)
      end
    end

    def remove(account_id, target_account_id)
      redis.with do |conn|
        conn.zrem("interactions:#{account_id}", target_account_id)
      end
    end

    def get(account_id, limit: 10, offset: 0)
      account_ids = []
      redis.with do |conn|
        account_ids = conn.zrevrange("interactions:#{account_id}", offset, limit)
      end
      return [] if account_ids.empty?

      pftSQL = <<-SQL
        select a.* from accounts a 
        left join follows f on f.target_account_id = a.id and f.account_id = :account_id
        left join blocks b1 on b1.target_account_id = a.id and b1.account_id = :account_id
        left join blocks b2 on b2.target_account_id = :account_id and b2.account_id = a.id
        where a.id in (:account_ids) and f.id is null and b1.id is null and b2.id is null
        and a.suspended_at is null and a.moved_to_account_id is null and a.domain is null
      SQL

      Account.find_by_sql([pftSQL, {account_id: account_id, account_ids: account_ids}])
    end
  end
end
