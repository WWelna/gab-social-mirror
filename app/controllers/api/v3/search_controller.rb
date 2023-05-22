# frozen_string_literal: true

class Api::V3::SearchController <  Api::BaseController
  after_action :insert_pagination_headers

  V3_SEARCH_RESULTS_LIMIT = 25
  V3_SEARCH_TYPES = [
    'account',
    'status',
    'group',
    'link',
    'feed',
    'hashtag',
  ]

  def index
    @search_results = search_results
    results = Search.new(@search_results)
    render json: results, serializer: REST::V3::SearchSerializer
  end

  private

  def result_key_by_type
    type = params[:type]

    if !defined?(type) || type.nil? || type.empty? || type == 'account'
      return :accounts
    elsif type == 'status'
      return :statuses
    elsif type == 'group'
      return :groups
    elsif type == 'hashtag'
      return :hashtags
    elsif type == 'link'
      return :links
    elsif type == 'feed'
      return :lists
    end

    # default
    return 'accounts'
  end

  def insert_pagination_headers
    links = []
    links << [next_path, [%w(rel next)]]
    response.headers['Link'] = LinkHeader.new(links) unless links.empty?
  end

  def next_path
    if records_continue?
      api_v3_search_v3_url pagination_params(page: next_page)
    end
  end

  def records_continue?
    return false if !@search_results || @search_results.nil? || @search_results[result_key_by_type].nil?
    @search_results[result_key_by_type].size == limit_param(V3_SEARCH_RESULTS_LIMIT)
  end

  def next_page
    page = params[:page]
    if !page.nil?
      page = page.to_i + 1
    else
      page = 2
    end
    page
  end

  def pagination_params(core_params)
    params.slice(
      :type, :onlyVerified, :q, :page
    ).permit(
      :type, :onlyVerified, :q, :page
    ).merge(core_params)
  end

  def validate_search_type!
    if !V3_SEARCH_TYPES.include?(search_params[:type].downcase) || search_params[:type].nil? || search_params[:type].empty?
      render json: { error: 'Invalid search type' }, status: 422
    else
      true
    end
  end

  def search_results
    SearchServiceV3.new.call(
      params[:q],
      current_account,
      params[:type],
      limit_param(V3_SEARCH_RESULTS_LIMIT),
      search_params.merge(resolve: truthy_param?(:resolve), onlyVerified: truthy_param?(:onlyVerified))
    )
  end

  def search_params
    params.permit(:type, :onlyVerified, :q, :resolve, :page)
  end
end


