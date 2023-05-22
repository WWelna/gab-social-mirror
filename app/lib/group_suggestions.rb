# frozen_string_literal: true

class GroupSuggestions
  EXPIRE_AFTER = 1.day.seconds
  MAX_ITEMS = 15
  KEY_PREFIX = 'groupsuggestions'

  class << self
    include Redisable

    def set(group_ids, account_id)
      return if group_ids.nil? || group_ids.empty? || account_id.nil?
      key = "#{KEY_PREFIX}:#{account_id}"
      redis.with do |conn|
        conn.setex(key, EXPIRE_AFTER, group_ids)
      end
    end

    def get(account_id)
      group_ids = []
      key = "#{KEY_PREFIX}:#{account_id}"
      redis.with do |conn|
        group_ids = conn.get(key)
      end

      if group_ids.nil? || group_ids.empty?
        # select 10 random groups this user is in
        joined_group_ids = GroupAccount.where(account_id: account_id, is_approved: true)
                                       .order(Arel.sql('RANDOM()'))
                                       .limit(10)
                                       .map(&:group_id)
        
        # - if none, just use featured groups
        if joined_group_ids.empty?
          joined_group_ids = Group.where(is_featured: true, is_archived: false) 
                                  .order(Arel.sql('RANDOM()'))
                                  .limit(10)
                                  .map(&:id)
        end

        # select 10 random members of those groups
        active_member_ids = GroupAccount.where(group_id: joined_group_ids, is_approved: true)
                                        .order(Arel.sql('RANDOM()'))
                                        .limit(10)
                                        .map(&:account_id)

        # select 5 groups they recently joined
        # combine all the groups
        # ensure this user isn't in any already
        related_group_ids = GroupAccount.where(account_id: active_member_ids, is_approved: true)
                                        .where.not(group_id: joined_group_ids)
                                        .order(created_at: :desc)
                                        .limit(50)
                                        .map(&:group_id)

        group_ids = related_group_ids

        # return
        set(group_ids, account_id) unless group_ids.nil? || group_ids.empty?
      else
        group_ids = JSON.parse(group_ids)
      end

      return [] if group_ids.nil? || group_ids.empty?

      Group.where(id: group_ids)
    end

    def remove(account_id, target_group_id)
      redis.with do |conn|
        conn.zrem("groupsuggestions:#{account_id}", target_group_id)
      end
    end
  end
end
