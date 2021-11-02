# frozen_string_literal: true
# == Schema Information
#
# Table name: account_stats
#
#  id              :bigint(8)        not null, primary key
#  account_id      :bigint(8)        not null
#  statuses_count  :bigint(8)        default(0), not null
#  following_count :bigint(8)        default(0), not null
#  followers_count :bigint(8)        default(0), not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  last_status_at  :datetime
#

class AccountStat < ApplicationRecord
  RESYNC_STATS_SQL = <<-SQL.squish
      WITH correct_stats AS (
        SELECT (SELECT COUNT(*) FROM statuses WHERE account_id = :account_id) AS statuses_count,
               (SELECT COUNT(*) FROM follows WHERE account_id = :account_id) AS following_count,
               (SELECT COUNT(*) FROM follows WHERE target_account_id = :account_id) AS followers_count,
               (SELECT MAX(created_at) FROM statuses WHERE account_id = :account_id) AS last_status_at
      )
      UPDATE account_stats AS current_stats
      SET statuses_count = correct_stats.statuses_count,
          followers_count = correct_stats.followers_count,
          following_count = correct_stats.following_count,
          last_status_at = correct_stats.last_status_at,
          updated_at = NOW()
      FROM correct_stats
      WHERE current_stats.account_id = :account_id
      AND (
        current_stats.statuses_count IS DISTINCT FROM correct_stats.statuses_count
        OR current_stats.followers_count IS DISTINCT FROM correct_stats.followers_count
        OR current_stats.following_count IS DISTINCT FROM correct_stats.following_count
        OR current_stats.last_status_at IS DISTINCT FROM correct_stats.last_status_at
      );
    SQL

  belongs_to :account, inverse_of: :account_stat

  def resync!(reload: true)
    return(nil) unless self.persisted?

    sql = self.class.sanitize_sql([RESYNC_STATS_SQL, { account_id: self.account_id }])
    self.class.connection.execute(sql)

    self.reload if reload

    return(nil)
  end
end
