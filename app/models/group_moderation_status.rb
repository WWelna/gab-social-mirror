# == Schema Information
#
# Table name: group_moderation_statuses
#
#  id         :bigint(8)        not null, primary key
#  account_id :bigint(8)
#  group_id   :bigint(8)
#  spam_score :integer
#  content    :jsonb
#  created_at :datetime         not null
#  updated_at :datetime         not null
#


class GroupModerationStatus < ApplicationRecord
  include Paginable
  belongs_to :account
  belongs_to :group
end
