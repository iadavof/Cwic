module ApplicationHelper
  def format_bool(bool)
    I18n.t(bool.to_s)
  end

  def format_text(text)
    text.present? ? text : I18n.t('none_html').html_safe
  end

  def generic_format(value)
    case value
    when TrueClass, FalseClass
      format_bool(value)
    when Integer
      number_with_delimiter(value)
    when Float, BigDecimal
      number_with_precision(value)
    when Date, Time, DateTime
      I18n.l(value, format: :long)
    else
      value
    end
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

  def format_help(text, type = :block)
    text = format_text(text)
    content_tag((type == :inline ? :span : :div), content_tag(:i, '', class: 'icon-info-sign', title: text), class: 'help')
  end

  def format_address(item)
    if item.route || item.street_number || item.postal_code || item.administrative_area_level_2 || item.administrative_area_level_1 || item.locality || item.country
      address = escape_once(item.route) + ' ' + escape_once(item.street_number) + tag('br') + escape_once(item.postal_code) + '&nbsp; ' + escape_once(item.locality).upcase + tag('br') + escape_once(item.country)
      address.html_safe
    end
  end

  def call_to(telephone_number, name = nil, html_options = {}, &block)
    telephone_number = ERB::Util.html_escape(telephone_number)

    html_options, name = name, nil if block_given?
    html_options = (html_options || {}).stringify_keys

    html_options["href"] = "tel:#{telephone_number}".html_safe

    content_tag(:a, name || telephone_number.html_safe, html_options, &block)
  end
end
