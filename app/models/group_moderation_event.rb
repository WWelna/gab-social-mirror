# == Schema Information
#
# Table name: group_moderation_events
#
#  id                         :bigint(8)        not null, primary key
#  account_id                 :bigint(8)
#  group_id                   :bigint(8)
#  status_id                  :bigint(8)
#  group_moderation_status_id :bigint(8)
#  approved                   :boolean          default(FALSE)
#  rejected                   :boolean          default(FALSE)
#  removed                    :boolean          default(FALSE)
#  reported                   :boolean          default(FALSE)
#  acted_at                   :datetime
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#


class GroupModerationEvent < ApplicationRecord
    include Paginable
    belongs_to :account
    belongs_to :group
    belongs_to :group_moderation_status, optional: true
    belongs_to :status, optional: true
  end
  
