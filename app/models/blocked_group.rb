# frozen_string_literal: true
# == Schema Information
#
# Table name: blocked_groups
#
#  id              :integer          not null, primary key
#  account_id      :integer          not null
#  target_group_id :integer          not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#

class BlockedGroup < ApplicationRecord

  belongs_to :account
  belongs_to :target_group, class_name: 'Group'

  validates :account_id, uniqueness: { scope: :target_group_id }

end
