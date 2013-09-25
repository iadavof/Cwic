module LinkHelper
  # Link helper for default links to scaffold (CRUD) pages
  # Link to object helpers
  def link_to_index(object, options = {})
    options[:name] ||= t('.to_index', default: :to_index_objects, classes: object_classes_name(object).lcfirst)
    options[:location] ||= polymorphic_path(object)
    link_to_if(can?(:index, relevant_object(object)), options[:name], options[:location], class: options[:css_class], data: { action: 'index' }, title: options[:title]) {}
  end

  def link_to_new(object, options = {})
    options[:name] ||= t('.to_new', default: :to_new_object, class: object_class_name(object).lcfirst)
    options[:location] ||= new_polymorphic_path(object)
    link_to_if(can?(:new, relevant_object(object)), options[:name], options[:location], class: options[:css_class], data: { action: 'new' }, title: options[:title]) {}
  end

  def link_to_show(object, options = {})
    options[:name] ||= t('.to_show', default: :to_show_object, class: object_class_name(object).lcfirst, name: object_name(object))
    options[:location] ||= object
    link_to_if(can?(:show, relevant_object(object)), options[:name], options[:location], class: options[:css_class], data: { action: 'show' }, title: options[:title])
  end

  def link_to_edit(object, options = {})
    options[:name] ||= t('.to_edit', default: :to_edit_object, class: object_class_name(object).lcfirst, name: object_name(object))
    options[:location] ||= edit_polymorphic_path(object)
    link_to_if(can?(:edit, relevant_object(object)), options[:name], options[:location], class: options[:css_class], data: { action: 'edit' }, title: options[:title]) {}
  end

  def link_to_destroy(object, options = {})
    options[:name] ||= t('.to_destroy', default: :to_destroy_object, class: object_class_name(object).lcfirst, name: object_name(object))
    options[:location] ||= object
    options[:confirm] ||= t('.to_destroy_confirm', default: :to_destroy_object_confirm, class: object_class_name(object).lcfirst, name: object_name(object))
    link_to_if(can?(:destroy, relevant_object(object)), options[:name], options[:location], method: :delete, data: { confirm: options[:confirm], action: 'destroy' }, class: options[:css_class], title: options[:title]) {}
  end

  # Link back to object helpers
  def link_back_to_index(object, options = {})
    options[:name] ||= t('.back_to_index', default: :back_to_index_objects, classes: object_classes_name(object).lcfirst)
    link_to_index(object, options)
  end

  def link_back_to_show(object, options = {})
    options[:name] ||= t('.back_to_show', default: :back_to_show_object, class: object_class_name(object).lcfirst, name: object_name(object))
    link_to_show(object, options)
  end

  # Name link to object helpers
  def name_link_to_show(object, options = {})
    options[:name] ||= object_name(object)
    options[:title] ||= t('.to_show', default: :to_show_object, class: object_class_name(object).lcfirst, name: object_name(object))
    link_to_show(object, options)
  end

  # Icon link to object helpers
  def icon_link_to_edit(object, options = {})
    options[:name] = ''
    options[:css_class] ||= 'icon icon-edit'
    options[:title] ||= t('.to_edit', default: :icon_to_edit_object, class: object_class_name(object).lcfirst, name: object_name(object))
    link_to_edit(object, options)
  end

  def icon_link_to_destroy(object, options = {})
    options[:name] = ''
    options[:css_class] ||= 'icon icon-remove'
    options[:title] ||= t('.to_destroy', default: :icon_to_destroy_object, class: object_class_name(object).lcfirst, name: object_name(object))
    link_to_destroy(object, options)
  end

  # Button link to object helpers
  def button_link_to_index(object, options = {})
    options[:css_class] ||= 'button'
    link_to_index(object, options)
  end

  def button_link_to_new(object, options = {})
    options[:css_class] ||= 'button'
    link_to_new(object, options)
  end

  def button_link_to_show(object, options = {})
    options[:css_class] ||= 'button'
    link_to_show(object, options)
  end

  def button_link_to_edit(object, options = {})
    options[:css_class] ||= 'button'
    link_to_edit(object, options)
  end

  def button_link_to_destroy(object, options = {})
    options[:css_class] ||= 'button'
    link_to_destroy(object, options)
  end

  # Button link back to object helpers
  def button_link_back_to_index(object, options = {})
    options[:css_class] ||= 'button'
    link_back_to_index(object, options)
  end

  def button_link_back_to_show(object, options = {})
    options[:css_class] ||= 'button'
    link_back_to_show(object, options)
  end

private
  # Helpers for the link helpers
  def relevant_object(object)
    case object
    when Array
      object.last
    when Hash
      relevant_object(object.values.last)
    else
      object
    end
  end

  def relevant_class(object)
    object = relevant_object(object)
    case object
    when Class
      object
    else
      object.class
    end
  end

  def object_classes_name(object)
    relevant_class(object).model_name.human(count: 2)
  end

  def object_class_name(object)
    relevant_class(object).model_name.human
  end

  def object_name(object)
    relevant_object(object).instance_name
  end
end