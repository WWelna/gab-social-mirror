# frozen_string_literal: true

class ApplicationRecord < ActiveRecord::Base
  connects_to database: {
    writing: :primary,
    reading: :slave1
  }
  self.abstract_class = true
  include Remotable

  # matching(:foo, :contains, 'bar')
  # WHERE "table_name"."foo" ILIKE '%bar%'
  #
  # matching(:foo, :starts_with, 'bar')
  # WHERE "table_name"."foo" ILIKE 'bar%'
  #
  # matching(:foo, :ends_with, 'bar')
  # WHERE "table_name"."foo" ILIKE '%bar'
  #
  # matching(:foo, :is, 'bar')
  # WHERE "table_name"."foo" ILIKE 'bar'
  def self.matching(field, operation, value)
    raise ArgumentError, 'Field not specified' unless field.present?
    return none unless value.present?

    sanitized = sanitize_sql_like(value.strip)
    pattern = case operation
    when :contains
      "%#{sanitized}%"
    when :starts_with
      "#{sanitized}%"
    when :ends_with
      "%#{sanitized}"
    when :is
      sanitized
    else
      raise ArgumentError, "Unknown operation #{operation}"
    end

    where(arel_table[field].matches(pattern))
  end

  # matches_array(:foo, '||', 'bar')
  # WHERE array_to_string("table_name"."foo", '||') ILIKE '%bar%'
  def self.matches_array(field, delimiter, value)
    raise ArgumentError, 'Field not specified' unless field.present?
    raise ArgumentError, 'Delimiter not specified' unless delimiter.present?
    return none unless value.present?

    where(
      Arel::Nodes::NamedFunction.new(
        'array_to_string',
        [
          arel_table[field],
          Arel::Nodes.build_quoted(sanitize_sql(delimiter)),
        ]
      ).matches("%#{sanitize_sql_like(value.strip)}%")
    )
  end
end
