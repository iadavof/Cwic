module TitleHelper
  # Title helper for default scaffold (CRUD) pages
  def index_title(object)
    t('.title', :default => :index_objects, :classes => object.model_name.human(:count => 2).lcfirst)
  end

  def new_title(object)
    t('.title', :default => :new_object, :class => object.model_name.human.lcfirst)
  end

  def show_title(object)
    t('.title', :default => :show_object, :class => object.class.model_name.human, :name => object.instance_name)
  end

  def edit_title(object)
   t('.title', :default => :edit_object, :class => object.class.model_name.human.lcfirst, :name => object.instance_name)
  end
end