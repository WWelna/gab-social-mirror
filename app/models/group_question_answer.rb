# == Schema Information
#
# Table name: group_question_answers
#
#  id                :bigint(8)        not null, primary key
#  group_id          :bigint(8)
#  account_id        :bigint(8)
#  group_question_id :integer          not null
#  answer            :string           not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#

class GroupQuestionAnswer < ApplicationRecord

  belongs_to :group
  belongs_to :account

  validates :account_id, uniqueness: { scope: :group_question_id }
  validates :answer, presence: true, length: { maximum: 500 }

end
