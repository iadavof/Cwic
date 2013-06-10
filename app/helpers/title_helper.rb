module TitleHelper
  # Title helper for default scaffold (CRUD) pages
  def index_title(object)
    t('.title_html', default: :index_objects_html, classes: object.model_name.human(count: 2).lcfirst)
  end

  def new_title(object)
    t('.title_html', default: :new_object_html, class: object.model_name.human.lcfirst)
  end

  def show_title(object)
    t('.title_html', default: :show_object_html, class: object.class.model_name.human, name: object.instance_name)
  end

  def edit_title(object)
   t('.title_html', default: :edit_object_html, class: object.class.model_name.human.lcfirst, name: object.instance_name)
  end
end