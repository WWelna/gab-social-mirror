# == Schema Information
#
# Table name: comment_conversations
#
#  id         :bigint(8)        not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class CommentConversation < ApplicationRecord
  has_many :comments
end
