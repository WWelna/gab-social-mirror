# == Schema Information
#
# Table name: comment_revisions
#
#  id         :bigint(8)        not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  comment_id :bigint(8)
#  text       :string
#

class CommentRevision < ApplicationRecord

end
