# frozen_string_literal: true

class SearchServiceV3 < BaseService
  def call(query, account, type, limit, options = {})
    @query   = query&.strip
    @account = account
    @options = options
    @limit = limit.to_i
    @resolve = options[:resolve] || false
    @onlyVerified = options[:onlyVerified] || false

    @page = options[:page]
    @page = 1 if @page.nil? || @page.to_i <= 0
    @page = @page.to_i
    @offset = (@page - 1) * @limit

    default_results.tap do |results|
      next if @query.blank? || @limit.zero? || !@query.present?

      if !defined?(type) || type.nil? || type.empty? || type == 'account'
        results[:accounts] = perform_accounts_search!
      
      elsif type == 'status'
        results[:statuses] = perform_statuses_search!(@query, @page, @limit)
      
      elsif type == 'group'
        results[:groups] = perform_groups_search!
      
      elsif type == 'hashtag'
        results[:hashtags] = perform_hashtags_search! if hashtag_searchable?
      
      elsif type == 'link'
        results[:links] = perform_links_search!
      
      elsif type == 'feed'
        results[:lists] = perform_lists_search!
      end
    end

  end

  private

  def default_results
    {
      accounts: [],
      statuses: [],
      groups: [],
      links: [],
      lists: [],
      hashtags: [],
    }
  end

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
      @offset,
      @limit,
    )
  end

  def perform_links_search!
    ids = PreviewCard.search_for(
      @query.gsub(/\A#/, '')
    )
    if ids.nil? || ids.empty?
      return []
    end
    links = PreviewCard.where(id: ids).order(created_at: :desc).limit(@limit).offset(@offset)
    links.reject { |link| 
      LinkBlock.block?(link.url)
    }
  end

  def perform_hashtags_search!
    Tag.search_for(
      @query.gsub(/\A#/, ''),
      @offset,
      @limit,
    )
  end

  def perform_lists_search!
    List.search_for(
      @query.gsub(/\A#/, ''),
      @offset,
      @limit,
    )
  end

  def perform_statuses_search!(query, page, limit)
    solr_results = Status.search do
      fulltext query do
        fields(:text)
        query_phrase_slop 1
      end
      order_by :created, :desc
      paginate page: page, per_page: limit
    end

    results = []
    solr_results.each_hit_with_result do |hit, result|
      results << result
    end    

    if !@account.nil?
      account_ids         = results.map(&:account_id)
      account_domains     = results.map(&:account_domain)
      preloaded_relations = relations_map_for_account(@account, account_ids, account_domains)

      results.reject { |status| StatusFilter.new(status, @account, preloaded_relations).filtered? }
    end
    results
  rescue Faraday::ConnectionFailed
    []
  end

  def hashtag_searchable?
    !@query.include?('@')
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
