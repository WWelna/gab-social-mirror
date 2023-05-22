# frozen_string_literal: true

class Api::V1::MarketplaceListings::BuyersController < Api::BaseController
  before_action :require_user!
  before_action :set_marketplace_listing

  # no pagination for now
  after_action :insert_pagination_headers

  def show
    @conversations = get_conversations
    render json: @conversations, each_serializer: REST::ChatConversationAccountSerializer
  end

  private

  def get_conversations
    conversationIds = MarketplaceListingChatConversation.where(
      marketplace_listing_id: @marketplace_listing
    ).pluck(:chat_conversation_id)
    
    current_account
      .chat_conversation_accounts
      .where(chat_conversation_id: conversationIds)
      .paginate_by_max_id(
        limit_param(DEFAULT_CHAT_CONVERSATION_LIMIT),
        params[:max_id],
        params[:since_id]
      )
  end

  def set_marketplace_listing
    # only query for CURRENT_ACCOUNT listing, ensure ownership!
    @marketplace_listing = current_account.marketplace_listings.find(params[:marketplace_listing_id])
  end

  def pagination_params(core_params)
    params.slice(:limit).permit(:limit).merge(core_params)
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    if records_continue?
      api_v1_marketplace_listing_buyers_url pagination_params(max_id: pagination_max_id)
    end
  end

  def prev_path
    unless @conversations.empty?
      api_v1_marketplace_listing_buyers_url pagination_params(min_id: pagination_since_id)
    end
  end

  def records_continue?
    @conversations.size == limit_param(DEFAULT_MARKETPLACE_LISTINGS_LIMIT)
  end

  def pagination_max_id
    @conversations.last.id
  end

  def pagination_since_id
    @conversations.first.id
  end
end
