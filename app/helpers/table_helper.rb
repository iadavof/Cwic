module TableHelper
  # Extend Kaminari paginate with prefix option
  def paginate(scope, options = {})
    options[:param_name] = "#{options[:prefix]}_page" if options[:prefix].present?
    super(scope, options)
  end

  def limiting(options = {})
    prefix = options[:prefix]
    limit_key = "#{prefix + '_' if prefix}limit"
    page_key = "#{prefix + '_' if prefix}page"
    render partial: 'tables/limiting', locals: { limit_key: limit_key, page_key: page_key }
  end

  def sortable_table_head(model, field, options = {})
    label = options[:lable]
    prefix = options[:prefix]
    content_tag(:th) do
      safe_join([
        table_head_label(model, field, label),
        sorting_icons(model, field, prefix)
      ], ' ')
    end
  end

  def table_head(model, field, label = nil)
    content_tag(:th, table_head_label(model, field, label))
  end

  def table_head_label(model, field, label)
    label || model.human_attribute_name(field.respond_to?(:first) ? field.first : field)
  end

  def sorting_icons(model, field, prefix = nil)
    sort_key = "#{prefix + '_' if prefix}sort"
    direction_key = "#{prefix + '_' if prefix}direction"
    page_key = "#{prefix + '_' if prefix}page"

    class_desc = %w(sortable-header-button desc)
    class_asc  = %w(sortable-header-button asc)

    field = field.join('+') if field.respond_to?(:join)

    if params[sort_key] == field.to_s
      class_desc << 'active' if params[direction_key] == 'desc'
      class_asc  << 'active' if params[direction_key] == 'asc'
    end

    content_tag(:span, class: 'sortable-header-buttons') do
      safe_join([
        link_to(icon('chevron-down'), params.merge({ sort_key => field, direction_key => 'desc', page_key => 1 }), class: class_desc),
        link_to(icon('chevron-up'), params.merge({ sort_key => field, direction_key => 'asc', page_key => 1 }), class: class_asc)
      ], ' ')
    end
  end

  def icon(name)
    content_tag(:i, "", class: 'icon icon-' + name)
  end

  def params_to_hidden_fields(*exclude)
    hash_to_hidden_fields(params.except(:action, :controller, :organisation_id, :utf8, *exclude))
  end
end
