class ActionView::Helpers::FormBuilder
  def label_with_required_class(method, text_or_options = nil, options = {}, &block)
    if text_or_options && text_or_options.class == Hash
      options = text_or_options
    else
      text = text_or_options
    end

    # Add a 'required' CSS class to the field label if the field is required
    if object.class.validators_on(method).map(&:class).include?(ActiveRecord::Validations::PresenceValidator)
      classes = options[:class].is_a?(String) ? options[:class].split(' ') : Array(options[:class]) # Classes as array with one item for each class
      classes << 'required'
      options[:class] = classes.uniq
    end

    self.label_without_required_class(method, text, options, &block)
  end
  alias_method_chain :label, :required_class
end

# Add a error class to fields with 'errors' instead of wrapping them with a div with class 'field_with_errors'
ActionView::Base.field_error_proc = Proc.new do |html_tag, instance|
  class_attr_index = html_tag.index 'class="'

  if class_attr_index
    html_tag.insert class_attr_index+7, 'validation-error '
  else
    html_tag.insert html_tag.index('>'), ' class="validation-error"'
  end
end
