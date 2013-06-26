module ApplicationHelper
  def format_bool(bool)
    I18n.t(bool.to_s)
  end

  # Format description (title) helpers. Useful for (a.o.) entities and entity types.
  def format_description_title(obj)
    obj = obj.description if obj.respond_to?(:description)
    obj = obj.gsub(/\s/i, ' ')
    obj.truncate(200, separator: ' ')
  end

  def format_description_with_name_title(obj)
     if obj.description.present?
      "#{obj.name} (#{format_description_title(obj)})"
    else
      "#{obj.name}"
    end
  end

  def format_description(obj)
    obj = obj.description if obj.respond_to?(:description)
    obj = obj.gsub(/\s/i, ' ')
    content_tag(:span, obj.truncate(100, separator: ' '), title: format_description_title(obj))
  end
end
