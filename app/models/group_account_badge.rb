# == Schema Information
#
# Table name: group_account_badges
#
#  id          :bigint(8)        not null, primary key
#  group_id    :bigint(8)
#  name        :string
#  color       :string
#  icon        :string
#  description :string
#

class GroupAccountBadge < ApplicationRecord

  belongs_to :group
  has_and_belongs_to_many :group_accounts

  validates_with GroupAccountBadgeValidator
  
  validates :name, presence: true, length: { maximum: 30 }

end
