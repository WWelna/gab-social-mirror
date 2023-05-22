class MarketplaceListingSearchService < BaseService
  attr_reader :account, :options

  def call(account = nil, limit, options)
    @account = account
    @options = options
    @limit = limit

    validate_params!

    results
  end

  private

  def validate_params!
    # : todo :
    true
  end

  def results
    scope = MarketplaceListing.only_running.limit(@limit).
      includes(:account, :marketplace_listing_category, :media_attachments)

    # default to latest if no sort_by given
    if !defined?(options) || options[:sort_by].nil? || defined?(options[:sort_by])
      scope = scope.reorder(created_at: :desc)
    end
    
    options.each do |key, value|
      scope = scope.merge scope_for(key, value) if !value.nil? && defined?(value) && value != ''
    end
    scope
  end

  private

  def scope_for(key, value)
    case key.to_sym
    when :query
      MarketplaceListing.matching(:title, :contains, value)
        .or(MarketplaceListing.matching(:description, :contains, value))
        .or(MarketplaceListing.where('tags @> ARRAY[?]::varchar[]', value.split(' ').map(&:strip)))
        .or(MarketplaceListing.where('tags @> ARRAY[?]::varchar[]', value.strip))
    when :id
      MarketplaceListing.where(id: value)
    when :tags
      MarketplaceListing.where('tags @> ARRAY[?]::varchar[]', value.split(',').map(&:strip))
    when :category_id
      MarketplaceListing.where(marketplace_listing_category_id: value)
    when :location
      MarketplaceListing.matching(:location, :contains, value)
    when :price_min
      MarketplaceListing.where(MarketplaceListing.arel_table[:price].gt(value))
    when :price_max
      MarketplaceListing.where(MarketplaceListing.arel_table[:price].lt(value))
    when :condition
      MarketplaceListing.where(condition: value)
    when :sort_by
      if value == 'oldest'
        MarketplaceListing.reorder(id: :asc)
      elsif value == 'price-asc'
        MarketplaceListing.reorder(price: :asc)
      elsif value == 'price-desc'
        MarketplaceListing.reorder(price: :desc)
      else
        MarketplaceListing.reorder(created_at: :desc)
      end
    when :account_id
      MarketplaceListing.where(account_id: value)
    when :shipping_required
      MarketplaceListing.where(is_shipping_required: value)
    # when :has_images
      # : todo :
      # MarketplaceListing.where(is_shipping_required: value)
    when :page
      offset = (value.to_i - 1) * @limit
      MarketplaceListing.offset(offset)
    else
      raise "Unknown filter: #{key}"
    end
  end

end
