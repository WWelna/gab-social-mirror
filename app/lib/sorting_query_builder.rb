# frozen_string_literal: true
class SortingQueryBuilder < BaseService
  LIMIT = 20

  MIN_LIKES = 5
  MIN_REBLOGS = 2
  MIN_REPLIES = 1

  TOP_ORDER = 'status_stats.favourites_count DESC, status_stats.reblogs_count DESC, status_stats.replies_count DESC'

  def call(sort_type, group = nil, page = 1, source = nil)
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
      without_replies.without_reblogs.
      joins(:account).
      where(accounts: { is_flagged_as_spam: false })

    # All sort types except "newest" require at least 1 comment
    @statuses = @statuses.joins(:status_stat) unless @sort_type == 'newest'

    @statuses = @statuses.none unless valid_page?
  end

  def max_page
    case @sort_type
    when 'newest'
      Float::INFINITY
    else
      8
    end
  end

  def valid_page?
    @page < max_page
  end

  def apply_conditions!
    @statuses = @statuses.with_public_visibility if @group.nil?

    if @source == 'explore'
      # no posts from groups in the explore feed
      @statuses = @statuses.where(group: nil)

      # Require a minimum amout of text, to remove posts that are basically just screenshots
      # Excluding NULL and '' to potentially utilize an index and avoid a LENGTH calculation
      @statuses = @statuses.where('statuses.text is not null and statuses.text != ?', '')
      @statuses = @statuses.where('length(statuses.text) > 50')

      # Filter out phrases that game the system to boost post interaction
      [
        'i follow back',
      ].each do |phrase|
        @statuses = @statuses.where('statuses.text not ilike ?', "%#{phrase}%")
      end
    elsif @group
      @statuses = @statuses.where(group: @group)
    end

    if @source != 'group_collection' && %w[recent newest].exclude?(@sort_type)
      @statuses = @statuses.where({
        status_stats: {
          replies_count: MIN_REPLIES..,
          reblogs_count: MIN_REBLOGS..,
          favourites_count: MIN_LIKES..,
        }
      })
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
    when 'newest'
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
    when 'newest'
      :unlimited
    when 'top_today'
      1.day
    when 'top_weekly'
      7.days
    when 'top_monthly'
      30.days
    when 'top_yearly'
      1.year
    when 'top_all_time'
      5.years
    end
  end

end
