module PgSearch
  attr_accessor :pg_search_rank

  module ClassMethods
    def pg_search_scope(name, options)
      options_proc = if options.respond_to?(:call)
                       options
                     else
                       unless options.respond_to?(:merge)
                         raise ArgumentError, "pg_search_scope expects a Hash or Proc"
                       end
                       lambda { |query| {query: query}.merge(options) }
                     end

      method_proc = lambda do |*args|
        config = Configuration.new(options_proc.call(*args), self)
        ScopeOptions.new(config)
      end

      if respond_to?(:define_singleton_method)
        define_singleton_method "#{name}_scope_options", &method_proc
      else
        (class << self; self; end).send :define_method, "#{name}_scope_options", &method_proc
      end

      method_proc = lambda do |*args|
        scope_options = self.send("#{name}_scope_options", *args)
        scope_options.apply(self)
      end

      if respond_to?(:define_singleton_method)
        define_singleton_method name, &method_proc
      else
        (class << self; self; end).send :define_method, name, &method_proc
      end
    end

    def pg_global_search(options)
      default_options = { using: { tsearch: { prefix: true, normalization: 1 } } }
      options = default_options.merge(options)
      pg_search_scope :global_search, options
    end
  end

  class ScopeOptions
    def rank_sql
      "(#{rank}) AS pg_search_rank"
    end
  end
end
