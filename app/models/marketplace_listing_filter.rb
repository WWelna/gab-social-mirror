# admin only
class MarketplaceListingFilter
  attr_reader :marketplace_listing, :account, :params

  def initialize(marketplace_listing, account, params)
    @marketplace_listing = marketplace_listing
    @account = account
    @params = params
  end

  def results
    scope = MarketplaceListing
    params.each do |key, value|
      scope = scope.merge scope_for(key, value) if !value.nil? && !value.empty?
    end
    scope
  end

  private

  def scope_for(key, value)
    case key.to_sym
    when :title
      MarketplaceListing.matching(:title, :contains, value)
    when :id
      MarketplaceListing.where(id: value)
    when :account_id
      MarketplaceListing.where(account_id: value)
    when :status
      MarketplaceListing.where(status: value)
    when :description
      MarketplaceListing.where(description: value)
    else
      raise "Unknown filter: #{key}"
    end
  end

end