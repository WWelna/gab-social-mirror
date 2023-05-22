# frozen_string_literal: true

class BatchedRemoveStatusService < BaseService
  #   include Redisable

  # Delete given statuses and reblogs of them
  # Dispatch PuSH updates of the deleted statuses, but only local ones
  # Dispatch Salmon deletes, unique per domain, of the deleted statuses, but only local ones
  # Remove statuses from home feeds
  # Push delete events to streaming API for home feeds and public feeds
  # @param [Status] statuses A preferably batched array of statuses
  # @param [Hash] options
  # @option [Boolean] :skip_side_effects
  def call(statuses, account, **options)
    statuses = Status.where(id: statuses.map(&:id)).includes(:account).flat_map { |status| [status] + status.reblogs.includes(:account).to_a }

    @account = account
    @mentions = statuses.each_with_object({}) { |s, h| h[s.id] = s.active_mentions.includes(:account).to_a }
    @tags     = statuses.each_with_object({}) { |s, h| h[s.id] = s.tags.pluck(:name) }

    @json_payloads = statuses.each_with_object({}) { |s, h| h[s.id] = Oj.dump(event: :delete, payload: s.id.to_s) }

    # Ensure that rendered XML reflects destroyed state
    statuses.each do |status|
      status.mark_for_mass_destruction!
      status.destroy
    end

    sync_status_stats

    return # if options[:skip_side_effects]

  end

  private

  def sync_status_stats
    account_stat = AccountStat.where(account_id: @account.id).first
    if !account_stat.nil?
      account_stat.resync_gabs!
    end
  end

end
