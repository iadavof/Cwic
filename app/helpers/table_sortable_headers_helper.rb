module TableSortableHeadersHelper
  def sortable_table_head(model, field, label = nil, prefix = nil)
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
    label || model.human_attribute_name(field)
  end

  def sorting_icons(model, field, prefix = nil)
    active_class_desc = %w(sortable-header-button desc)
    active_class_asc  = %w(sortable-header-button asc)

    if params[:sort] == field
      active_class_desc << 'active' if params[:direction] == 'desc'
      active_class_asc  << 'active' if params[:direction] == 'asc'
    end

    field = "#{model.table_name}+#{field}"
    content_tag(:span) do
      safe_join([
        link_to(icon('chevron-down'), params.merge({ "#{prefix + '_' if prefix}sort" => field, "#{prefix + '_' if prefix}direction" => 'desc', "#{prefix + '_' if prefix}page" => 1 }), class: active_class_desc),
        link_to(icon('chevron-up'), params.merge({ "#{prefix + '_' if prefix}sort" => field, "#{prefix + '_' if prefix}direction" => 'asc', "#{prefix + '_' if prefix}page" => 1 }), class: active_class_asc)
      ], ' ')
    end
  end

  def icon(name)
    content_tag(:i, "", class: 'icon icon-' + name)
  end
end