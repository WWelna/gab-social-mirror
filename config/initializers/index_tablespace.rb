# Update the migrator to allow a tablespace to be defined:
#
# Example:
#   add_index :accounts, :weighted_tsv, using: 'gin', algorithm: :concurrently, tablespace: :fasttablespace
#
# Copied the original method definition and added a few lines
# Only adds the tablespace in production, since it won't exist in development
#
# https://github.com/rails/rails/blob/v6.0.4.7/activerecord/lib/active_record/connection_adapters/postgresql/schema_statements.rb#L441-L446

raise 'Make sure this patch still works' unless ActiveRecord.version.to_s == '6.0.4.7'

ActiveRecord::ConnectionAdapters::PostgreSQL::SchemaStatements.class_eval do
  def add_index(table_name, column_name, options = {})
    tablespace_name = options.delete(:tablespace) # Added to support tablespace

    index_name, index_type, index_columns_and_opclasses, index_options, index_algorithm, index_using, comment = add_index_options(table_name, column_name, **options)

    # Added to support tablespace
    if tablespace_name
      if ActiveRecord::Base.connection.select_value("SELECT spcname FROM pg_tablespace where spcname = '#{tablespace_name}'")
        index_options += " TABLESPACE #{tablespace_name}"
      else
        ActiveRecord::Base.logger.warn("Skipping setting TABLESPACE to '#{tablespace_name}' because that tablespace does not exist")
      end
    end

    execute("CREATE #{index_type} INDEX #{index_algorithm} #{quote_column_name(index_name)} ON #{quote_table_name(table_name)} #{index_using} (#{index_columns_and_opclasses})#{index_options}").tap do
      execute "COMMENT ON INDEX #{quote_column_name(index_name)} IS #{quote(comment)}" if comment
    end
  end
end
