# == Schema Information
#
# Table name: list_removed_accounts
#
#  id         :bigint(8)        not null, primary key
#  list_id    :bigint(8)        not null
#  account_id :bigint(8)        not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class ListRemovedAccount < ApplicationRecord
  belongs_to :list
  belongs_to :account
end
