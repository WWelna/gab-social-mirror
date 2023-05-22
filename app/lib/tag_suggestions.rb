# frozen_string_literal: true

class TagSuggestions
  EXPIRE_AFTER = 1.day.seconds
  MAX_ITEMS = 15
  KEY_PREFIX = 'tagsuggestions'

  class << self
    include Redisable

    def set(tag_ids, account_id)
      return if tag_ids.nil? || tag_ids.empty? || account_id.nil?
      key = "#{KEY_PREFIX}:#{account_id}"
      redis.with do |conn|
        conn.setex(key, EXPIRE_AFTER, tag_ids)
      end
    end

    def get(account_id)
      tag_ids = []
      key = "#{KEY_PREFIX}:#{account_id}"
      redis.with do |conn|
        # tag_ids = conn.get(key)
      end

      if tag_ids.nil? || tag_ids.empty?
        # get my most recent 5 following
        accounts = Follow.where(account_id: account_id)
                         .recent
                         .limit(5)
                         .map(&:account)

        # map accounts to find their most used tags
        found_tag_ids = accounts.map{|account|
          Tag.most_used(account).limit(10).map(&:id)
        }.flatten

        tag_ids = found_tag_ids

        # return
        set(tag_ids, account_id) unless tag_ids.nil? || tag_ids.empty?
      else
        tag_ids = JSON.parse(tag_ids)
      end

      return [] if tag_ids.nil? || tag_ids.empty?

      Tag.where(id: tag_ids)
    end

    def remove(account_id, target_tag_id)
      redis.with do |conn|
        conn.zrem("tagsuggestions:#{account_id}", target_tag_id)
      end
    end
  end
end
