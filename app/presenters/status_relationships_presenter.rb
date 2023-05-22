# frozen_string_literal: true

class StatusRelationshipsPresenter
  attr_reader :reblogs_map, :favourites_map, :mutes_map,
              :blocked_by_map

  def initialize(statuses, current_account_id = nil, **options)
    statuses = statuses.compact
    status_ids = statuses.flat_map { |s| [s.id, s.reblog_of_id, s.quote_of_id] }.uniq.compact

    if current_account_id.nil? || statuses.empty?
      @reblogs_map = {}
      @favourites_map = {}
      @mutes_map = {}
      @blocked_by_map = {}
    else
      conversation_ids = statuses.map(&:conversation_id).compact.uniq
      status_account_ids = statuses.map(&:account_id).compact.uniq.reject { |account_id| account_id.to_s == current_account_id.to_s }

      @reblogs_map = Status.reblogs_map(status_ids, current_account_id).merge(options[:reblogs_map] || {})
      @favourites_map = Status.favourites_map(status_ids, current_account_id).merge(options[:favourites_map] || {})
      @mutes_map = Status.mutes_map(conversation_ids, current_account_id).merge(options[:mutes_map] || {})
      @blocked_by_map = Account.blocked_by_map(status_account_ids, current_account_id)
    end

  end
end
