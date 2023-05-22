# == Schema Information
#
# Table name: marketplace_listing_chat_conversations
#
#  id                     :bigint(8)        not null, primary key
#  marketplace_listing_id :bigint(8)        not null
#  chat_conversation_id   :bigint(8)        not null
#  chat_message_id        :bigint(8)
#


class MarketplaceListingChatConversation < ApplicationRecord

  belongs_to :marketplace_listing
  belongs_to :chat_conversation
  belongs_to :chat_message

  validates :marketplace_listing_id, uniqueness: { scope: :chat_conversation_id }  

end
