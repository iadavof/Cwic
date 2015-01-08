module LinkHelper
  # Link helper for default links to scaffold (CRUD) pages
  # Link to object helpers
  def link_to_index(object, options = {})
    name = options.delete(:name) || t('.to_index', default: :to_index_objects, models: object_classes_name(object).lcfirst)
    location_query = options.delete(:location_query) || {}
    location = options.delete(:location) || polymorphic_path(object, location_query)
    options = { data: { action: 'index' } }.deep_merge(options)
    link_to_if(can?(:index, relevant_object(object)), name, location, options) {}
  end

  def link_to_new(object, options = {})
    name =  options.delete(:name) || t('.to_new', default: :to_new_object, model: object_class_name(object))
    location_query = options.delete(:location_query) || {}
    location = options.delete(:location) || new_polymorphic_path(object, location_query)
    options = { data: { action: 'new' } }.deep_merge(options)
    link_to_if(can?(:new, relevant_object(object)), name, location, options) {}
  end

  def link_to_show(object, options = {})
    name = options.delete(:name) || t('.to_show', default: :to_show_object, model: object_class_name(object).lcfirst, name: object_name(object))
    location_query = options.delete(:location_query) || {}
    location = options.delete(:location) || polymorphic_path(object, location_query)
    options = { data: { action: 'show' } }.deep_merge(options)
    link_to_if(can?(:show, relevant_object(object)), name, location, options)
  end

  def link_to_edit(object, options = {})
    name = options.delete(:name) || t('.to_edit', default: :to_edit_object, model: object_class_name(object).lcfirst, name: object_name(object))
    location_query = options.delete(:location_query) || {}
    location = options.delete(:location) || edit_polymorphic_path(object, location_query)
    options = { data: { action: 'edit' } }.deep_merge(options)
    link_to_if(can?(:edit, relevant_object(object)), name, location, options) {}
  end

  def link_to_destroy(object, options = {})
    name = options.delete(:name) || t('.to_destroy', default: :to_destroy_object, model: object_class_name(object).lcfirst, name: object_name(object))
    location_query = options.delete(:location_query) || {}
    location = options.delete(:location) || polymorphic_path(object, location_query)
    confirm = options.delete(:confirm) || t('.to_destroy_confirm', default: :to_destroy_object_confirm, model: object_class_name(object).lcfirst, name: object_name(object))
    options = { method: :delete, data: { action: 'destroy', confirm: confirm } }.deep_merge(options)
    link_to_if(can?(:destroy, relevant_object(object)), name, location, options) {}
  end

  def link_to_action(object, action, options = {})
    name = options.delete(:name) || t(".to_#{action}", default: :to_action_object, action: action, class: object_class_name(object).lcfirst, name: object_name(object))
    location_query = options.delete(:location_query) || {}
    location = options.delete(:location) || polymorphic_path(object, location_query.merge!(action: action))
    options = options.merge(data: { action: action })
    link_to_if(can?(action, relevant_object(object)), name, location, options) {}
  end

  # Name link to object helpers
  def name_link_to_show(object, options = {})
    options[:name] ||= object_name(object)
    options[:title] ||= t('.to_show', default: :to_show_object, model: object_class_name(object).lcfirst, name: object_name(object))
    link_to_show(object, options)
  end

  # Icon link to object helpers
  def icon_link_to_new(object, options = {})
    options[:name] = ''
    options[:class] ||= 'icon icon-plus action-button'
    options[:title] ||= t('.to_new', default: :icon_to_new_object, model: object_class_name(object))
    link_to_new(object, options)
  end

  def icon_link_to_edit(object, options = {})
    options[:name] = ''
    options[:class] ||= 'icon icon-edit action-button'
    options[:title] ||= t('.to_edit', default: :icon_to_edit_object, model: object_class_name(object), name: object_name(object))
    link_to_edit(object, options)
  end

  def icon_link_to_destroy(object, options = {})
    options[:name] = ''
    options[:class] ||= 'icon icon-remove action-button'
    options[:title] ||= t('.to_destroy', default: :icon_to_destroy_object, model: object_class_name(object), name: object_name(object))
    link_to_destroy(object, options)
  end

  def icon_link_to_action(object, action, options = {})
    options[:name] = ''
    options[:class] ||= 'icon'
    options[:class] += " #{options[:icon]}" if options[:icon].present?
    options[:title] ||= t(".to_#{action}", default: :to_action_object, action: action, model: object_class_name(object), name: object_name(object))
    link_to_action(object, action, options)
  end

  # Button link to object helpers
  def button_link_to_index(object, options = {})
    options[:class] ||= 'button'
    link_to_index(object, options)
  end

  def button_link_to_new(object, options = {})
    options[:class] ||= 'button'
    link_to_new(object, options)
  end

  def button_link_to_show(object, options = {})
    options[:class] ||= 'button'
    link_to_show(object, options)
  end

  def button_link_to_edit(object, options = {})
    options[:class] ||= 'button'
    link_to_edit(object, options)
  end

  def button_link_to_destroy(object, options = {})
    options[:class] ||= 'button'
    link_to_destroy(object, options)
  end

  def button_link_to_action(object, action, options = {})
    options[:class] ||= 'button'
    link_to_action(object, action, options)
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
