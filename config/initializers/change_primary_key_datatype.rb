# Use bigserial primary key as the default data type for primary key (id) columns, to prevent running out of space.
require 'active_record/connection_adapters/postgresql_adapter'
# Change primary_key data type to bigserial (8 bytes large)
ActiveRecord::ConnectionAdapters::PostgreSQLAdapter::NATIVE_DATABASE_TYPES[:primary_key] = "bigserial primary key"

# Force data type of references/associations (reference_id fields) to limit 8 (equals bigint equals bigserial)
class ActiveRecord::ConnectionAdapters::TableDefinition
  def references_with_limit(*args)
    references_without_limit(*extend_references_options_with_limit(*args))
  end
  alias_method_chain :references, :limit
end

module ActiveRecord::ConnectionAdapters::SchemaStatements
  def add_reference_with_limit(*args)
    add_reference_without_limit(*extend_references_options_with_limit(*args))
  end
  alias_method_chain :add_reference, :limit
end

def extend_references_options_with_limit(*args)
  options = args.extract_options!
  if options[:polymorphic]
    # This is a polymorphic association, explicetely set options for type field so we do set a limit for the type field.
    options[:polymorphic] = options.dup unless options[:polymorphic].is_a?(Hash) # Options were already explicetely set, do not overwrite this.
  end
  options[:limit] = 8 unless options.has_key?(:limit) # Set limit to 8 for id field of association
  [*args, options]
end
