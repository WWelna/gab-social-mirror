# == Schema Information
#
# Table name: group_accounts
#
#  id                     :bigint(8)        not null, primary key
#  group_id               :bigint(8)        not null
#  account_id             :bigint(8)        not null
#  write_permissions      :boolean          default(FALSE), not null
#  role                   :string
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  is_approved            :boolean
#  group_account_badge_id :bigint(8)
#

class GroupAccount < ApplicationRecord
  self.ignored_columns = ["unread_count"]
  # : todo : enum: 1,2,3,4,5...
  enum role: {
    admin: "admin",
    moderator: "moderator"
  }

  belongs_to :group
  belongs_to :account

  has_one :group_account_badge

  validates :account_id, uniqueness: { scope: :group_id }

  after_commit :remove_relationship_cache
  after_create :increment_member_count
  after_create :remove_group_block
  after_destroy :decrement_member_count

  private

  def remove_relationship_cache
    Rails.cache.delete("relationship:#{account_id}:group#{group_id}")
  end

  def increment_member_count
    group&.increment!(:member_count)
  end

  def decrement_member_count
    group&.decrement!(:member_count)
  end

  def remove_group_block
    BlockedGroup.where(target_group_id: group_id, account_id: account_id).destroy_all
  end
end
