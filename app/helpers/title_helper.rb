module TitleHelper
  # Title helper for default scaffold (CRUD) pages
  def index_title(object)
    t('.title_html', default: :index_objects_html, models: object.model_name.human(count: 2).lcfirst)
  end

  def index_title_of(object, name)
    t('.title_html_of', default: :index_objects_html_of, models: object.model_name.human(count: 2).lcfirst, name: instance_name)
  end

  def new_title(object)
    t('.title_html', default: :new_object_html, model: object.model_name.human)
  end

  def show_title(object)
    t('.title_html', default: :show_object_html, model: object.class.model_name.human, name: object.instance_name)
  end

  def edit_title(object)
   t('.title_html', default: :edit_object_html, model: object.class.model_name.human.lcfirst, name: object.instance_name)
  end

  def search_shortcut(object)
    case(object.class.name)
      when 'OrganisationClient'
        return content_tag(:div, content_tag(:span, 'c#') + object.id.to_s, id: 'search-shortcut');
      when 'Reservation'
        return content_tag(:div, content_tag(:span, 'r#') + object.id.to_s, id: 'search-shortcut');
      else
        return ''
    end
  end
end
