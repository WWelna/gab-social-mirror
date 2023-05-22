# frozen_string_literal: true

class Api::V1::Accounts::MediaAttachmentsController < Api::BaseController
  before_action :set_account
  after_action :insert_pagination_headers

  def index
    @media_attachments = load_media

    statusIds = []
    listingIds = []
    medias = []

    @media_attachments.each do |media|
      medias << REST::MediaAttachmentSerializer.new(media)

      s = media.status_id
      m = media.marketplace_listing_id

      statusIds << s if !statusIds.include?(s)
      listingIds << m if !listingIds.include?(m)
    end

    statuses = []
    statuses = Status.where(id: statusIds) if !statusIds.empty?
    statuses_s = statuses.map do |status|
      REST::StatusSerializer.new(status, { exclude_media: true, exclude_account: true })
    end

    listings = []
    listings = MarketplaceListing.where(id: listingIds) if !listingIds.empty?
    listings_s = listings.map do |listing|
      REST::MarketplaceListingSerializer.new(listing, { exclude_media: true, exclude_account: true })
    end

    final = {}
    if !medias.empty?
      final['account'] = REST::AccountSerializer.new(@account)
      final['media_attachments'] = medias
      final['statuses'] = statuses_s if !statuses_s.empty?
      final['marketplace_listings'] = listings_s if !listings_s.empty?
    end

    return render json: final
  end

  private

  def set_account
    @account = Account.find(params[:account_id])
  end

  def load_media
    return [] if hide_results?

    scope = @account.media_attachments.excluding_scheduled

    if !query_params[:type].nil? && !query_params[:type].empty?
      if query_params[:type] == 'image' || query_params[:type] == 'video' || query_params[:type] == 'gifv'
        scope = scope.where(type: query_params[:type])
      else
        return render json: { "error": true }, status: 422
      end
    end

    if !query_params[:source].nil? && !query_params[:source].empty?
      if query_params[:source] == 'status'
        scope = scope.where.not(status_id: nil)
      elsif query_params[:source] == 'marketplace_listing'
        scope = scope.where.not(marketplace_listing_id: nil)
      else
        return render json: { "error": true }, status: 422
      end
    end

    scope = scope.paginate_by_max_id(
      limit_param(DEFAULT_MEDIA_ATTACHMENTS_LIMIT),
      params[:max_id],
      params[:since_id]
    )

    scope
  end

  def hide_results?
    current_account.nil? || current_account && @account.blocking?(current_account)
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    if records_continue?
      api_v1_account_media_attachments_url pagination_params(max_id: pagination_max_id)
    end
  end

  def prev_path
    unless @media_attachments.empty?
      api_v1_account_media_attachments_url pagination_params(since_id: pagination_since_id)
    end
  end

  def pagination_max_id
    @media_attachments.last.id
  end

  def pagination_since_id
    @media_attachments.first.id
  end

  def records_continue?
    @media_attachments.size == limit_param(DEFAULT_MEDIA_ATTACHMENTS_LIMIT)
  end

  def pagination_params(core_params)
    params
      .slice(:limit, :type, :source)
      .permit(:limit, :type, :source)
      .merge(core_params)
  end

  def query_params
    params.permit(:type, :source)
  end
end
