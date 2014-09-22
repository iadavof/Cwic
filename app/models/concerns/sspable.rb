module Sspable
  extend ActiveSupport::Concern

  included do
    scope :search_for_params, -> (params = {}, options = {}) {
      search = ssp_value(:mini_search, params, options)
      global_search("%#{search}%") if search && !search.blank?
    }
    scope :sort_for_params, -> (params = {}, options = {}) {
      sort = ssp_value(:sort, params, options)
      direction = ssp_value(:direction, params, options)
      (sort.include?('+') ? sort_on_association(sort, direction) : sort_on_class_attribute(self, sort, direction)) if sort && direction
    }
    scope :page_for_params, -> (params = {}, options = {}) {
      limit = ssp_value(:limit, params, options)
      page = ssp_value(:page, params, options)
      limit.present? ? page(page).per(limit) : page(page) unless page.present? && page == 'false'
    }
    scope :ssp, -> (params = {}, options = {}) {
      search_for_params(params, options).sort_for_params(params, options).page_for_params(params, options)
    }
  end

  module ClassMethods
    def default_order(&block)
      @default_order = block
      default_scope &block
    end

    def sort_on_class_attribute(cls, sort, direction)
      check_sort_attribute(cls, sort)
      check_sort_direction(direction)
      reorder("#{cls.table_name}.#{sort} #{direction.upcase}").merge(@default_order)
    end

    def check_sort_attribute(cls, sort)
      raise "Invalid sort attribute name '#{sort}'" unless cls.attribute_names.include?(sort)
    end

    def check_sort_direction(direction)
      raise "Invalid sort direction '#{direction}'" unless %w(asc desc).include?(direction)
    end

    def sort_on_association(sort, direction)
      split = sort.split('+')
      association_name = split[0]
      raise "Association named '#{association_name}'' does not exist" unless self.reflect_on_all_associations.map(&:name).map(&:to_s).include?(association_name) # Check if the association exist (before symbolizing and reflecting)
      association = self.reflect_on_association(association_name.to_sym) # Reflect on the association
      cls = association.klass # Get the class of the association
      sort = split[1] # Set the attribute for sorting
      joins(association.name).sort_on_class_attribute(cls, sort, direction) # Join on the association (so we can sort on it) and perform the sorting!
    end

  private
    def ssp_value(key, params, options)
      prefix = options[:prefix]
      params["#{prefix + '_' if prefix}#{key}"]
    end
  end
end
