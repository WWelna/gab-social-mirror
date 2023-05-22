# == Schema Information
#
# Table name: comment_stats
#
#  id              :bigint(8)        not null, primary key
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  comment_id      :bigint(8)        not null
#  replies_count   :bigint(8)        default(0), not null
#  reactions_count :bigint(8)        default(0), not null
#

class CommentStat < ApplicationRecord
  belongs_to :comment, inverse_of: :comment_stat
end
