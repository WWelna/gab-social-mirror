CREATE OR REPLACE FUNCTION isnumeric(text) RETURNS BOOLEAN AS $$
DECLARE x NUMERIC;
BEGIN
    x = $1::NUMERIC;
    RETURN TRUE;
EXCEPTION WHEN others THEN
    RETURN FALSE;
END;
$$
STRICT
LANGUAGE plpgsql IMMUTABLE;


create or replace function function_get_parent_comment_tree(child_status_id bigint) returns ltree as $$
 declare mypath varchar; 
begin
 WITH RECURSIVE cte AS(
    select id as Child, in_reply_to_id as Parent, id || ''  as Tree from statuses where id = child_status_id
    UNION ALL
    select id as Child, in_reply_to_id as Parent, Parent || '.' || Tree  as Tree from statuses s
    INNER JOIN cte c on c.Parent = s.id
 ) 
select text2ltree(cte.Parent || '.' || Tree) as path from cte order by parent asc limit 1 into mypath;
return mypath;
end; 
$$ LANGUAGE plpgsql;


create or replace function function_get_comment_count(status_id bigint) returns int as $$
DECLARE 
  mypath varchar;
BEGIN
with recursive comment_counter AS (
select id, in_reply_to_id from statuses where in_reply_to_id = status_id
union select s.id, c.in_reply_to_id from statuses s
  join comment_counter c on s.in_reply_to_id = c.id
)
select count(*) from comment_counter into mypath;
return mypath;
end;
$$ LANGUAGE plpgsql;


create or replace function function_get_direct_comment_count(status_id bigint) returns int as $$
DECLARE 
  mypath varchar;
BEGIN
select count(*) from statuses where in_reply_to_id = status_id into mypath;
return mypath;
end;
$$ LANGUAGE plpgsql;


create or replace function function_update_all_comment_counts(child_status_id bigint) returns void as $$
DECLARE
  status_ids bigint[];sid bigint;
BEGIN
  if isnumeric(cast(child_status_id as text)) is false then
    return;
  end if;
  select string_to_array(trim(trailing '.' from concat(child_status_id, '.', cast(function_get_parent_comment_tree(child_status_id) as text))), '.') into status_ids;
  select array(select distinct unnest(status_ids)) into status_ids;
  if status_ids is null then
    return;
  end if;
  FOREACH sid IN ARRAY (status_ids)
  LOOP
    if isnumeric(cast(sid as text)) is false then
      continue;
    end if;
    insert into status_stats as ss (status_id, replies_count, direct_replies_count, reblogs_count, favourites_count, created_at, updated_at)
    VALUES (sid, function_get_comment_count(sid), function_get_direct_comment_count(sid), 0, 0, now(), now())
    on conflict (status_id) do update set replies_count = EXCLUDED.replies_count, direct_replies_count = EXCLUDED.direct_replies_count, updated_at = EXCLUDED.updated_at 
        where ss.replies_count != EXCLUDED.replies_count or ss.direct_replies_count != EXCLUDED.direct_replies_count;
  END LOOP;
END;
$$ LANGUAGE plpgsql;


create or replace function trigger_sync_reply_counts() returns trigger as $$
BEGIN
IF tg_op = 'INSERT' then
  IF NEW.reply and isnumeric(cast(NEW.in_reply_to_id as text)) THEN  
    PERFORM function_update_all_comment_counts(NEW.in_reply_to_id);
    return NEW;
  END IF;
END IF;
IF tg_op = 'UPDATE' then
  IF OLD.in_reply_to_id is not null and isnumeric(cast(OLD.in_reply_to_id as text)) and NEW.in_reply_to_id is null then
      PERFORM function_update_all_comment_counts(OLD.in_reply_to_id);
      return NEW;
  END IF;
END IF;
IF tg_op = 'DELETE' then
  IF OLD.in_reply_to_id IS NOT NULL and isnumeric(cast(OLD.in_reply_to_id as text)) then
      PERFORM function_update_all_comment_counts(OLD.in_reply_to_id);
      return OLD;
    END IF;
    return OLD;
END IF;
return NEW;
EXCEPTION when others then
  return null;
END;
$$ LANGUAGE plpgsql VOLATILE;



create trigger sync_reply_counts after insert or delete or update on statuses for each row execute procedure trigger_sync_reply_counts();