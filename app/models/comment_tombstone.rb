# frozen_string_literal: true

# == Schema Information
#
# Table name: comment_tombstones
#
#  id         :bigint(8)        not null, primary key
#  comment_id :bigint(8)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class CommentTombstone < ApplicationRecord
  include Paginable

  belongs_to :comment
end
