# frozen_string_literal: true
# == Schema Information
#
# Table name: status_bookmark_collections
#
#  id         :bigint(8)        not null, primary key
#  title      :text             default(""), not null
#  account_id :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class StatusBookmarkCollection < ApplicationRecord

  PER_ACCOUNT_LIMIT = 150

  belongs_to :account, inverse_of: :status_bookmark_collections
  
  validates_each :account_id, on: :create do |record, _attr, value|
    record.errors.add(:base, 'Maximum bookmark collection limit of 150 reached.') if StatusBookmarkCollection.where(account_id: value).count >= PER_ACCOUNT_LIMIT
  end

end
