# == Schema Information
#
# Table name: comment_conversation_mutes
#
#  id                      :bigint(8)        not null, primary key
#  account_id              :integer          not null
#  comment_conversation_id :bigint(8)        not null
#

class CommentConversationMute < ApplicationRecord
  belongs_to :account
  belongs_to :comment_conversation
end
