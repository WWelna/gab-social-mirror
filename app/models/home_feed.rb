# frozen_string_literal: true

class HomeFeed < Feed
  def initialize(account)
    @type    = :home
    @id      = account.id
    @account = account
  end

  def get(limit = 20, max_id = nil, since_id = nil, min_id = nil)
    ActiveRecord::Base.connected_to(role: :reading) do
      from_database(limit, max_id, since_id, min_id)
    end
  end

  private

  def from_database(limit, max_id, since_id, min_id)
    Status.find_by_sql([<<-SQL, { id: @id, limit: limit, min_id: min_id, max_id: max_id }])
      with cte as
      (
        select
          row_number() over (partition by sid.reblog_of_id order by sid.id desc) as rn_dupe,
          sid.*
        FROM
         (select
          s.id,
          s.reblog_of_id
         from statuses s
         left join statuses r
           on s.reblog_of_id = r.id
         where
          s.created_at > NOW() - INTERVAL '7 days'
          and s.reply is false
          and (exists(select ff.target_account_id from follows ff where ff.account_id = :id and ff.target_account_id = s.account_id)
            or s.account_id = :id)
          and not exists(select mm.target_account_id from mutes mm where mm.account_id = :id and mm.target_account_id in (s.account_id, r.account_id))
          and not exists(select bb.target_account_id from blocks bb where bb.account_id = :id and bb.target_account_id in (s.account_id, r.account_id))
          and (:max_id is null or s.id < :max_id)
          and (:min_id is null or s.id > :min_id)
         order by s.created_at desc
          limit :limit
        ) sid
      )
      select
        so.*
      from cte
      inner join statuses so on cte.id = so.id
      where
          cte.rn_dupe = 1 or cte.reblog_of_id is null
      order by so.created_at desc
    SQL
  end
end
