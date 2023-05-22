# frozen_string_literal: true
# == Schema Information
#
# Table name: account_warnings
#
#  id                :bigint(8)        not null, primary key
#  account_id        :bigint(8)
#  target_account_id :bigint(8)
#  action            :integer          default("none"), not null
#  text              :text             default(""), not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  user_dismissed_at :datetime
#

class AccountWarning < ApplicationRecord
  include Paginable

  enum action: %i(none disable silence suspend soft_suspend unsuspend), _suffix: :action

  belongs_to :account, inverse_of: :account_warnings
  belongs_to :target_account, class_name: 'Account', inverse_of: :targeted_account_warnings

  scope :latest, -> { reorder(created_at: :desc) }
  scope :custom, -> { where.not(text: '') }
  scope :not_dismissed, -> { where(user_dismissed_at: nil) }
  scope :dismissed, -> { where.not(user_dismissed_at: nil) }
  scope :user_visible_warnings, -> { where("created_at >= ?", Date.parse('10-05-2021')) }
end
