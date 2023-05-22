# frozen_string_literal: true

class HomeFeed < Feed
  ALLQUERY = <<-SQL
    with my_groups as (
      select ga.group_id as id
      from group_accounts ga
      where ga.account_id = :id
      and not exists(select from group_removed_accounts gra where ga.group_id = gra.group_id and ga.account_id = gra.account_id)
    ),
    cte as
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
        s.id > :hard_limit_id
        and s.reply is false
        and s.tombstoned_at IS NULL
        and (
          exists(
            select ff.target_account_id from follows ff where ff.account_id = :id and ff.target_account_id = s.account_id
          )
          or s.account_id = :id
        )
        and not exists(select mm.target_account_id from mutes mm where mm.account_id = :id and mm.target_account_id in (s.account_id, r.account_id))
        and not exists(select bb.target_account_id from blocks bb where bb.account_id = :id and bb.target_account_id in (s.account_id, r.account_id))
        and (
          s.group_id IS NULL
          or exists(
            select from groups g
            where g.id = s.group_id
            and (not g.is_private or g.id in (select id from my_groups))
          )
        )
        and (:max_id is null or s.id < :max_id)
        and (:min_id is null or s.id > :min_id)
       order by s.id desc
        limit :limit
      ) sid
    )
    select
      so.*
    from cte
    inner join statuses so on cte.id = so.id
    where
        cte.rn_dupe = 1 or cte.reblog_of_id is null
    order by so.id desc
  SQL

  OCQUERY = <<-SQL
    with my_groups as (
      select ga.group_id as id
      from group_accounts ga
      where ga.account_id = :id
      and not exists(select from group_removed_accounts gra where ga.group_id = gra.group_id and ga.account_id = gra.account_id)
    ),
    cte as
    (
      select
        s.id
      from statuses s
      where
        s.id > :hard_limit_id
        and s.reblog_of_id is null
        and s.reply is false
        and s.tombstoned_at IS NULL
        and (
          exists(
            select ff.target_account_id from follows ff where ff.account_id = :id and ff.target_account_id = s.account_id
          )
          or s.account_id = :id
        )
        and not exists(select mm.target_account_id from mutes mm where mm.account_id = :id and mm.target_account_id = s.account_id)
        and not exists(select bb.target_account_id from blocks bb where bb.account_id = :id and bb.target_account_id = s.account_id)
        and (
          s.group_id IS NULL
          or exists(
            select from groups g
            where g.id = s.group_id
            and (not g.is_private or g.id in (select id from my_groups))
          )
        )
        and (:max_id is null or s.id < :max_id)
        and (:min_id is null or s.id > :min_id)
      order by s.id desc
      limit :limit
    )
    select
      so.*
    from cte
    inner join statuses so on cte.id = so.id
    order by so.id desc
  SQL

  TOPQUERY = <<-SQL
    with my_groups as (
      select ga.group_id as id
      from group_accounts ga
      where ga.account_id = :id
      and not exists(select from group_removed_accounts gra where ga.group_id = gra.group_id and ga.account_id = gra.account_id)
    ),
    cte as
    (
      select
        s.id, coalesce(ss.favourites_count,0) + coalesce(ss.reblogs_count,0) as score
      from statuses s
      join status_stats ss on s.id = ss.status_id
      where
        s.id > :hard_limit_id
        and s.reblog_of_id is null
        and s.reply is false
        and s.tombstoned_at IS NULL
        and (
          exists(
            select ff.target_account_id from follows ff where ff.account_id = :id and ff.target_account_id = s.account_id
          )
          or s.account_id = :id
        )
        and not exists(select mm.target_account_id from mutes mm where mm.account_id = :id and mm.target_account_id = s.account_id)
        and not exists(select bb.target_account_id from blocks bb where bb.account_id = :id and bb.target_account_id = s.account_id)
        and (
          s.group_id IS NULL
          or exists(
            select from groups g
            where g.id = s.group_id
            and (not g.is_private or g.id in (select id from my_groups))
          )
        )
    )
    select
      score, so.*
    from cte
    inner join statuses so on cte.id = so.id
    order by cte.score desc
    limit :limit
    offset ((:page - 1) * :limit)
  SQL

  QUERY_OPTIONS = {
    'newest' => [ALLQUERY, 7.days],
    'no-reposts' => [OCQUERY, 7.days],
    'top' => [TOPQUERY, 1.day],
  }

  def initialize(account)
    @type    = :home
    @id      = account.id
    @account = account
  end

  def get(limit = 20, max_id = nil, since_id = nil, min_id = nil, sort_by_value = nil, page = nil)
    sort_by_value ||= 'newest'
    query, duration = QUERY_OPTIONS[sort_by_value]
    return(Status.none) unless query

    opts = { id: @id, limit: limit, min_id: min_id, max_id: max_id }
    opts[:hard_limit_id] = GabSocial::Snowflake.id_at(duration.ago)
    opts[:page] = page if sort_by_value == 'top'

    ActiveRecord::Base.connected_to(role: :reading) do
      Status.find_by_sql([query, opts])
    end
  end

end
