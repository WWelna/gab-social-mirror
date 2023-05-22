class AddIndexedTsvectorToAccounts < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!

  def change
    add_column :accounts, :weighted_tsv, :tsvector
    add_index :accounts, :weighted_tsv, using: 'gin', algorithm: :concurrently, tablespace: :fasttablespace
    create_function :account_weighted_tsv_trigger

    reversible do |dir|
      dir.up { create_trigger :update_account_tsvector }
      dir.down { execute('DROP TRIGGER IF EXISTS update_account_tsvector ON accounts;') }
    end

    reversible do |dir|
      dir.up do
        now = Time.current.to_s(:db)
        update("UPDATE accounts SET updated_at = '#{now}'")
      end
    end
  end
end
