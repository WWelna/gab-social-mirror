# frozen_string_literal: true
# == Schema Information
#
# Table name: list_subscribers
#
#  id         :bigint(8)        not null, primary key
#  list_id    :bigint(8)        not null
#  account_id :bigint(8)        not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class ListSubscriber < ApplicationRecord
  belongs_to :list
  belongs_to :account

  validates :account_id, uniqueness: { scope: :list_id }
  
  after_create :increment_subscriber_count
  after_destroy :decrement_subscriber_count

  private

  def increment_subscriber_count
    list&.increment!(:subscriber_count)
  end

  def decrement_subscriber_count
    list&.decrement!(:subscriber_count)
  end
end
