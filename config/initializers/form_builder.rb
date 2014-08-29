# Add a 'required' CSS class to the field label if the field is required
class ActionView::Helpers::FormBuilder
  def label_with_required_class(method, text_or_options = nil, options = {}, &block)
    if text_or_options && text_or_options.class == Hash
      options = text_or_options
    else
      text = text_or_options
    end

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

# Make sure errors on associations are also set on the _id and _ids fields
module ActionView::Helpers::ActiveModelInstanceTag
  def error_message_with_associations
    if @method_name.end_with?('_ids') # Check for a has_(and_belongs_to_)many association (these always use the _ids postfix field).
      association = object.class.reflect_on_association(@method_name.chomp('_ids').pluralize.to_sym)
    else # Check for a belongs_to association with method_name matching the foreign key column
      association = object.class.reflect_on_all_associations.detect { |a| a.macro == :belongs_to && a.foreign_key == @method_name  }
    end
    if association.present?
      object.errors[association.name] + error_message_without_associations
    else
      error_message_without_associations
    end
  end
  alias_method_chain :error_message, :associations
end
