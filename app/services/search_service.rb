# frozen_string_literal: true

class SearchService < BaseService
  def call(query, account, limit, options = {})
    @query   = query&.strip
    @account = account
    @account = account
    @options = options
    if @account.user.staff?
      @limit = 100
    else
      @limit = limit.to_i
    end
    @offset  = options[:type].blank? ? 0 : options[:offset].to_i
    @resolve = options[:resolve] || false
    @onlyVerified = options[:onlyVerified] || false

    default_results.tap do |results|
      next if @query.blank? || @limit.zero?

      if @query.present?
        results[:accounts] = perform_accounts_search! if account_searchable?
        results[:groups] = perform_groups_search!
        results[:hashtags] = perform_hashtags_search! if hashtag_searchable? && @account.vpdi?
      end
    end
  end

  private

  def perform_accounts_search!
    AccountSearchService.new.call(
      @query,
      @account,
      limit: @limit,
      resolve: @resolve,
      offset: @offset,
      onlyVerified: @onlyVerified
    )
  end

  def perform_groups_search!
    Group.search_for(
      @query.gsub(/\A#/, ''),
      @offset
    )
  end

  def perform_links_search!
    ids = PreviewCard.search_for(
      @query.gsub(/\A#/, '')
    )
    if ids.nil? || ids.empty?
      return []
    end
    PreviewCard.where(id: ids).order(created_at: :desc).limit(25).offset(@offset)
  end

  def perform_hashtags_search!
    Tag.search_for(
      @query.gsub(/\A#/, ''),
      @offset
    )
  end

  def default_results
    { accounts: [], hashtags: [], statuses: [], links: [], groups: [] }
  end

  def hashtag_searchable?
    hashtag_search? && !@query.include?('@')
  end

  def account_searchable?
    account_search? && !(@query.include?('@') && @query.include?(' '))
  end

  def account_search?
    @options[:type].blank? || @options[:type] == 'accounts'
  end

  def statuses_search?
    @options[:type].blank? || @options[:type] == 'statuses'
  end

  def hashtag_search?
    @options[:type].blank? || @options[:type] == 'hashtags'
  end

  def relations_map_for_account(account, account_ids, domains)
    {
      blocking: Account.blocking_map(account_ids, account.id),
      blocked_by: Account.blocked_by_map(account_ids, account.id),
      muting: Account.muting_map(account_ids, account.id),
      following: Account.following_map(account_ids, account.id),
    }
  end
end
