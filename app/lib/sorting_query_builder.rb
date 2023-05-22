# frozen_string_literal: true
class SortingQueryBuilder < BaseService
  LIMIT = 20

  MIN_LIKES = 5
  MIN_REBLOGS = 2
  MIN_REPLIES = 1

  TOP_ORDER = 'status_stats.favourites_count DESC, status_stats.reblogs_count DESC, status_stats.replies_count DESC'

  def call(sort_type, group = nil, page = 1, source = nil, options = {})
    @options = options
    @source = source

    if page && page.to_i > 250
      return Status.none
    end
    set_atts(sort_type, group, page, source)

    build_base_relation!
    apply_date_limit!
    apply_sort!
    apply_conditions!

    return @statuses
  end

  def deduped_with_cache(sort_type, group = nil, page = 1, source = nil)
    set_atts(sort_type, group, page, source)

    raise('Cannot cache infinity pages') if max_page.infinite?
    return(Status.none) unless valid_page?

    cache_key = ['sorting_query_builder', sort_type, group, source]

    cached_status_ids = Rails.cache.fetch(cache_key, expires_in: 1.minute) do
      call(sort_type, group, 1, source).
        limit(LIMIT * max_page * 2).
        offset(0).
        pluck(:id, :account_id).
        uniq { |_sid, aid| aid }.
        map(&:first).
        first(LIMIT * max_page)
    end

    sorted_id_page = Kaminari.paginate_array(cached_status_ids).page(page).per(LIMIT)

    statuses = Status.where(id: sorted_id_page).index_by(&:id)

    return sorted_id_page.map { |id| statuses[id] }.compact
  end

  private

  def set_atts(sort_type, group = nil, page = 1, source = nil)
    @sort_type = sort_type
    @group = group
    @page = parse_page(page)
    @source = source
  end

  def build_base_relation!
    @statuses = Status.
      page(@page).
      per(LIMIT).
      without_replies.
      joins(:account).
      where(accounts: { is_flagged_as_spam: false })

    if @sort_type == 'newest' && is_account_timeline?
      # include reblogs on newest (default sort) account timelines
    else 
      @statuses = @statuses.without_reblogs
    end

    # All sort types except "newest", "no-reposts" require at least 1 comment
    @statuses = @statuses.joins(:status_stat) unless ['newest', 'no-reposts'].include?(@sort_type)

    @statuses = @statuses.none unless valid_page?
  end

  def max_page
    case @sort_type
    when 'newest', 'no-reposts'
      Float::INFINITY
    else
      12
    end
  end

  def valid_page?
    @page < max_page
  end

  def apply_conditions!
    @statuses = @statuses.not_tombstoned
    
    if is_my_account_timeline?
      # show all on mine
    elsif is_account_timeline?
      @statuses = @statuses.where(visibility: [:public, :unlisted])
    elsif @group.nil?
      @statuses = @statuses.with_public_visibility
    end

    if @source == 'explore'
      # no posts from groups in the explore feed
      @statuses = @statuses.where(group: nil)

      @statuses = @statuses.where({
        status_stats: {
          replies_count: MIN_REPLIES..,
          reblogs_count: MIN_REBLOGS..,
          favourites_count: MIN_LIKES..,
        }
      })

      @statuses = @statuses.joins(account: :account_stat).where(account: { account_stats: { following_count: -Float::INFINITY..20_000 } })
    elsif @group
      @statuses = @statuses.where('"statuses".group_id is not null').where(group: @group)
    end
  end

  def apply_date_limit!
    return if duration == :unlimited

    date_limit = duration&.ago

    @statuses = if date_limit.nil?
      @statuses.none
    elsif @sort_type == 'recent'
      @statuses.where(status_stats: { updated_at: date_limit.. })
    else
      @statuses.since(date_limit)
    end
  end

  def apply_sort!
    @statuses = case @sort_type
    when 'newest', 'no-reposts'
      @statuses.recent
    when 'recent'
      @statuses.reorder('status_stats.updated_at desc')
    else
      @statuses.reorder(TOP_ORDER)
    end
  end

  def parse_page(page)
    page.blank? ? 1 : page.to_i
  end

  def duration
    case @sort_type
    when 'hot'
      8.hours
    when 'recent'
      @source == 'group_collection' ? 14.days : 5.years
    when 'newest', 'no-reposts'
      :unlimited
    when 'most_votes_today', 'top_today'
      1.day
    when 'most_votes_weekly', 'top_weekly'
      7.days
    when 'most_votes_monthly', 'top_monthly'
      30.days
    when 'most_votes_yearly', 'top_yearly'
      1.year
    when 'most_votes_all_time', 'top_all_time'
      5.years
    end
  end

  def is_account_timeline?
    !@source.nil? && @source.starts_with?('account:')
  end

  def is_my_account_timeline?
    return false if !is_account_timeline?
  
    if !@options[:current_account].nil?
      current_account = @options[:current_account]
    end
    if !@options[:source_account_id].nil?
      source_account_id = @options[:source_account_id]
    end

    return false if !current_account || !source_account_id

    return current_account.id.to_s == source_account_id.to_s
  end

end
