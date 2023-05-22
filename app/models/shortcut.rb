# frozen_string_literal: true
# == Schema Information
#
# Table name: shortcuts
#
#  id            :bigint(8)        not null, primary key
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  account_id    :bigint(8)        not null
#  shortcut_id   :bigint(8)        not null
#  shortcut_type :string           default(""), not null
#

class Shortcut < ApplicationRecord
  SHORTCUT_TYPE_MAP = {
    account: 'account',
    group: 'group',
    list: 'list',
  }.freeze

  belongs_to :account

  PER_ACCOUNT_LIMIT = 100

  validates_each :account_id, on: :create do |record, _attr, value|
    record.errors.add(:base, I18n.t('shortcuts.errors.limit')) if Shortcut.where(account_id: value).count >= PER_ACCOUNT_LIMIT
  end
end
