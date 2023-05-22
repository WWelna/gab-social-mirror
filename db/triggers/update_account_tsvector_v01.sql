CREATE TRIGGER update_account_tsvector BEFORE INSERT OR UPDATE
ON accounts
FOR EACH ROW EXECUTE PROCEDURE account_weighted_tsv_trigger();
