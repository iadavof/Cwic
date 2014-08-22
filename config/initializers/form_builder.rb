class ActionView::Helpers::FormBuilder
  alias :orig_label :label

  # add a 'required' CSS class to the field label if the field is required
  def label(method, content_or_options = nil, options = nil, &block)
    if content_or_options && content_or_options.class == Hash
      options = content_or_options
    else
      content = content_or_options
    end

    if object.class.validators_on(method).map(&:class).include? ActiveRecord::Validations::PresenceValidator
      if options.class != Hash
        options = {class: "required"}
      else
        options[:class] = ((options[:class] || "") + " required").split(" ").uniq.join(" ")
      end
    end

    self.orig_label(method, content, options || {}, &block)
  end
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
