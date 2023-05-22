# == Schema Information
#
# Table name: group_questions
#
#  id          :bigint(8)        not null, primary key
#  group_id    :bigint(8)
#  title       :string
#  description :string
#  index       :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

class GroupQuestion < ApplicationRecord
  
  belongs_to :group

  validates_with GroupQuestionValidator

  validates :title, presence: true, length: { maximum: 120 }

end
