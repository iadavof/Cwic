module EntitiesHelper
  def render_field(f)
    case f.object.entity_type_property.data_type.form_type
    when 'collection_select'
      f.collection_select(:value, f.object.entity_type_property.entity_type_property_options, :id, :name, { title: format_description_with_name_title(f.object.entity_type_property), (f.object.entity_type_property.required? ? :prompt : :include_blank) => true })
    when 'collection_select_multi'
      f.collection_select(:value_ids, f.object.entity_type_property.entity_type_property_options, :id, :name, { title: format_description_with_name_title(f.object.entity_type_property) }, { multiple: true })
    else
      f.send(f.object.entity_type_property.data_type.form_type.to_sym, :value, title: format_description_with_name_title(f.object.entity_type_property), value: f.object.formatted_value)
    end
  end
end
