module Sspable
  extend ActiveSupport::Concern

  included do
    scope :search_for_params, -> (options = {}) {
      prefix = options[:prefix]
      search_field = (prefix ? prefix + '_mini_search' : 'mini_search').to_sym
      global_search("%#{options[search_field]}%") if options[search_field] && !options[search_field].blank?
    }
    scope :sort_for_params, -> (options = {}) {
      prefix = options[:prefix]
      sort_field = (prefix ? prefix + '_sort' : 'sort').to_sym
      direction_field = (prefix ? prefix + '_direction' : 'direction').to_sym
      options[sort_field] = options[sort_field].gsub('+', '.') if options[sort_field]
      reorder("#{options[sort_field]} #{options[direction_field]}") if options[sort_field] && options[direction_field] && %w(asc desc).include?(options[direction_field])
    }
    scope :page_for_params, -> (options = {}) {
      prefix = options[:prefix]
      limit_field = (prefix ? prefix + '_limit' : 'limit').to_sym
      page_field = (prefix ? prefix + '_page' : 'page').to_sym
      options[limit_field].present? ? page(options[page_field]).per(options[limit_field]) : page(options[page_field])
    }
    scope :ssp, -> (options = {}) {
      search_for_params(options).sort_for_params(options).page_for_params(options)
    }
  end
end