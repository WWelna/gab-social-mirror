CREATE OR REPLACE FUNCTION account_weighted_tsv_trigger() RETURNS trigger AS $$
begin
  new.weighted_tsv :=
     setweight(to_tsvector('simple', COALESCE(new.display_name,'')), 'A') ||
     setweight(to_tsvector('simple', COALESCE(new.username,'')), 'B');
  return new;
end
$$ LANGUAGE plpgsql;
