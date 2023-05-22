# frozen_string_literal: true
# == Schema Information
#
# Table name: status_stats
#
#  id                   :bigint(8)        not null, primary key
#  status_id            :bigint(8)        not null
#  replies_count        :bigint(8)        default(0), not null
#  reblogs_count        :bigint(8)        default(0), not null
#  favourites_count     :bigint(8)        default(0), not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  quotes_count         :integer
#  top_reactions        :string
#  direct_replies_count :integer
#

class StatusStat < ApplicationRecord
  belongs_to :status, inverse_of: :status_stat
  attr_readonly :replies_count
  after_commit :reset_parent_cache

  private

  def reset_parent_cache
    Rails.cache.delete("status_stats/#{id}")
    Rails.cache.delete("reactions_counts:#{status_id}")
    Rails.cache.delete("statuses/#{status_id}")
  end
end
