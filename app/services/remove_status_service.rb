# frozen_string_literal: true

class RemoveStatusService < BaseService
  include Redisable

  def call(status, **options)
    @status       = status
    @account      = status.account
    @reblogs      = status.reblogs.includes(:account).to_a
    @options      = options

    reblog_of_id = status.reblog_of_id
    status_id = status.id
    account_id = status.account.id
    opp = status.in_reply_to_id

    RedisLock.acquire(lock_options) do |lock|
      if lock.acquired?
        begin
          remove_reblogs
          # Publish a delete status event to altstream
          Redis.current.publish("altstream:main", Oj.dump(event: :delete_status, payload: {account_id: account_id.to_s, id: status_id.to_s}))
          @status.destroy
          if !opp.nil?
            Rails.cache.delete("statuses/#{opp}")
            clear_parent_caches(opp)
          end

        rescue Errno::ECONNREFUSED => e
          # Ignore a connection refused error from SolR, which happens at least locally.
        end
      else
        raise GabSocial::RaceConditionError
      end
    end

    # If the status was a reblog of a recent post, send a stats update for the original status
    if !reblog_of_id.nil?
      original_status = Status.find(reblog_of_id)        
      if original_status.created_at > 8.hours.ago          
        payload = InlineRenderer.render(original_status, nil, :status_stat)
        Redis.current.publish("altstream:main", Oj.dump(event: :status_stat, payload: payload))
      end
    end
    

  end

  private

  def clear_parent_caches(status_id)
    parent = Status.where(id: status_id).pluck(:in_reply_to_id).first
    Rails.cache.delete("statuses/#{parent}") unless parent.nil?
    clear_parent_caches(parent) unless parent.nil?
  end

  def remove_reblogs
    # We delete reblogs of the status before the original status,
    # because once original status is gone, reblogs will disappear
    # without us being able to do all the fancy stuff

    @reblogs.each do |reblog|
      # Publish a delete status event to altstream
      if reblog.created_at > 8.hours.ago
        Redis.current.publish("altstream:main", Oj.dump(event: :delete_status, payload: {account_id: @account.id.to_s, id: reblog.id.to_s}))
      end
      RemoveStatusService.new.call(reblog, original_removed: true)
    end
  end

  def lock_options
    { redis: Redis.current, key: "distribute:#{@status.id}" }
  end
end
