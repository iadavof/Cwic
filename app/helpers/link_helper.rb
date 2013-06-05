module LinkHelper
  # Link helper for default links to scaffold (CRUD) pages
  # Link to object helpers
  def link_to_index(object, name = nil, location = nil, css_class = nil, title = nil)
    name ||= t('.to_index', :default => :to_index_objects, :classes => object.model_name.human(:count => 2).lcfirst)
    location ||= polymorphic_path(object)
    link_to_if(can?(:index, object), name, location, :class => css_class, :'data-action' => 'index', :title => title) {}
  end

  def link_to_new(object, name = nil, location = nil, css_class = nil, title = nil)
    name ||= t('.to_new', :default => :to_new_object, :class => object.model_name.human.downcase.lcfirst)
    location ||= new_polymorphic_path(object)
    link_to_if(can?(:new, object), name, location, :class => css_class, :'data-action' => 'new', :title => title) {}
  end

  def link_to_show(object, name = nil, location = nil, css_class = nil, title = nil)
    name ||= t('.to_show', :default => :to_show_object, :class => object.class.model_name.human.lcfirst, :name => object.instance_name)
    location ||= object
    link_to_if(can?(:show, object), name, location, :class => css_class, :'data-action' => 'show', :title => title)
  end

  def link_to_edit(object, name = nil, location = nil, css_class = nil, title = nil)
    name ||= t('.to_edit', :default => :to_edit_object, :class => object.class.model_name.human.lcfirst, :name => object.instance_name)
    location ||= edit_polymorphic_path(object)
    link_to_if(can?(:edit, object), name, location, :class => css_class, :'data-action' => 'edit', :title => title) {}
  end

  def link_to_destroy(object, name = nil, location = nil, css_class = nil, title = nil)
    name ||= t('.to_destroy', :default => :to_destroy_object, :class => object.class.model_name.human.lcfirst, :name => object.instance_name)
    location ||= object
    link_to_if(can?(:destroy, object), name, location, method: :delete, data: { confirm: t('.destroy_are_you_sure', :default => :destroy_are_you_sure) }, :class => css_class, :'data-action' => 'destroy', :title => title) {}
  end

  # Link back to object helpers
  def link_back_to_index(object, name = nil, location = nil, css_class = nil, title = nil)
    name ||= t('.back_to_index', :default => :back_to_index_objects, :classes => object.model_name.human(:count => 2).lcfirst)
    location ||= object
    link_to_index(object, name, location, css_class, title)
  end

  def link_back_to_show(object, name = nil, location = nil, css_class = nil, title = nil)
    name ||= t('.back_to_show', :default => :back_to_show_object, :class => object.class.model_name.human.lcfirst, :name => object.instance_name)
    location ||= object
    link_to_show(object, name, location, css_class, title)
  end

  # Name link to object helpers
  def name_link_to_show(object, name = nil, location = nil, css_class = nil, title = nil)
    name ||= object.instance_name
    title ||= t('.to_show', :default => :to_show_object, :class => object.class.model_name.human.lcfirst, :name => object.instance_name)
    link_to_show(object, name, location, css_class, title)
  end

  # Icon link to object helpers
  def icon_link_to_edit(object, alt = nil, location = nil, css_class = nil, title = nil)
    # alt is now useless since we do not use real images anymore, but font-awesome icons
    title ||= t('.to_edit', :default => :icon_to_edit_object, :class => object.class.model_name.human.lcfirst, :name => object.instance_name)
    css_class ||= 'icon icon-edit'
    link_to_edit(object, '', location, css_class, title)
  end

  def icon_link_to_destroy(object, alt = nil, location = nil, css_class = nil, title = nil)
    # alt is now useless since we do not use real images anymore, but font-awesome icons
    title ||= t('.to_destroy', :default => :icon_to_destroy_object, :class => object.class.model_name.human.lcfirst, :name => object.instance_name)
    css_class ||= 'icon icon-remove'
    link_to_destroy(object, '', location, css_class, title)
  end

  # Button link to object helpers
  def button_link_to_index(object, name = nil, location = nil, css_class = nil, title = nil)
    css_class ||= 'button'
    link_to_index(object, name, location, css_class, title)
  end

  def button_link_to_new(object, name = nil, location = nil, css_class = nil, title = nil)
    css_class ||= 'button'
    link_to_new(object, name, location, css_class, title)
  end

  def button_link_to_show(object, name = nil, location = nil, css_class = nil, title = nil)
    css_class ||= 'button'
    link_to_show(object, name, location, css_class, title)
  end

  def button_link_to_edit(object, name = nil, location = nil, css_class = nil, title = nil)
    css_class ||= 'button'
    link_to_edit(object, name, location, css_class, title)
  end

  def button_link_to_destroy(object, name = nil, location = nil, css_class = nil, title = nil)
    css_class ||= 'button'
    link_to_destroy(object, name, location, css_class, title)
  end

  # Button link back to object helpers
  def button_link_back_to_index(object, name = nil, location = nil, css_class = nil, title = nil)
    css_class ||= 'button'
    link_back_to_index(object, name, location, css_class, title)
  end

  def button_link_back_to_show(object, name = nil, location = nil, css_class = nil, title = nil)
    css_class ||= 'button'
    link_back_to_show(object, name, location, css_class, title)
  end
end