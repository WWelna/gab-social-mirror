# frozen_string_literal: true

class ListSuggestions
  EXPIRE_AFTER = 1.day.seconds
  MAX_ITEMS = 15
  KEY_PREFIX = 'listsuggestions'

  class << self
    include Redisable

    def set(list_ids, account_id)
      return if list_ids.nil? || list_ids.empty? || account_id.nil?
      key = "#{KEY_PREFIX}:#{account_id}"
      redis.with do |conn|
        conn.setex(key, EXPIRE_AFTER, list_ids)
      end
    end

    def get(account_id)
      list_ids = []
      key = "#{KEY_PREFIX}:#{account_id}"
      redis.with do |conn|
        list_ids = conn.get(key)
      end

      if list_ids.nil? || list_ids.empty?
        # select 10 random lists this user is in
        joined_list_ids = ListAccount.where(account_id: account_id)
                                       .order(Arel.sql('RANDOM()'))
                                       .limit(10)
                                       .map(&:list_id)
        
        # - if none, just use featured lists
        if joined_list_ids.empty?
          joined_list_ids = List.where(is_featured: true) 
                                  .order(Arel.sql('RANDOM()'))
                                  .limit(10)
                                  .map(&:id)
        end

        # select 10 random members of those lists
        active_member_ids = ListAccount.where(list_id: joined_list_ids)
                                        .order(Arel.sql('RANDOM()'))
                                        .limit(10)
                                        .map(&:account_id)

        # select 5 lists they recently joined
        # combine all the lists
        # ensure this user isn't in any already
        related_list_ids = ListAccount.where(account_id: active_member_ids)
                                        .where.not(list_id: joined_list_ids)
                                        .order(id: :desc)
                                        .limit(50)
                                        .map(&:list_id)

        list_ids = related_list_ids

        # return
        set(list_ids, account_id) unless list_ids.nil? || list_ids.empty?
      else
        list_ids = JSON.parse(list_ids)
      end

      return [] if list_ids.nil? || list_ids.empty?

      List.where(id: list_ids)
    end

    def remove(account_id, target_list_id)
      redis.with do |conn|
        conn.zrem("listsuggestions:#{account_id}", target_list_id)
      end
    end
  end
end
