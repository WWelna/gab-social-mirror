# frozen_string_literal: true
# == Schema Information
#
# Table name: chat_conversations
#
#  id                        :bigint(8)        not null, primary key
#  created_at                :datetime         not null
#  updated_at                :datetime         not null
#  last_chat_message_id      :bigint(8)
#  last_chat_message_sent_at :datetime
#

class ChatConversation < ApplicationRecord
  
  belongs_to :last_chat_message, class_name: 'ChatMessage', optional: true
  
end
