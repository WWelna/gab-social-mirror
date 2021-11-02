# frozen_string_literal: true
# == Schema Information
#
# Table name: unfollows
#
#  id                :bigint(8)        not null, primary key
#  account_id        :bigint(8)
#  target_account_id :bigint(8)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#

class Unfollow < ApplicationRecord
  include Paginable

  belongs_to :account
  belongs_to :target_account, class_name: 'Account'

  # can have more than 1 row of same data

  validates_with UnfollowLimitValidator, on: :create
end

