module ApplicationHelper
  def format_bool(bool)
    I18n.t(bool.to_s)
  end

  def format_text(text)
    text.present? ? text : I18n.t('none_html').html_safe
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

  def format_help(text)
    text = format_text(text)
    content_tag(:div, content_tag(:i, '', class: 'icon-info-sign') + content_tag(:p, text), class: 'help')
  end

  def params_to_hidden_fields(*exclude)
    hash_to_hidden_fields(params.except(:action, :controller, :organisation_id, :utf8, *exclude))
  end

  def include_google_maps_lib
    content_for(:javascript_libs) do
      javascript_include_tag('https://maps.google.com/maps/api/js?sensor=false')
    end
  end
end
