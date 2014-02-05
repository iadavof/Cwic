# Overwrite ActiveModel::Errors to support errors without message (message is false)
class ActiveModel::Errors
  # Allow html_safe error messages (e.g. to add links in error messages)
  def full_message_with_html_safe(attribute, message)
    full_message = full_message_without_html_safe(attribute, message)
    message.html_safe? ? full_message.html_safe : full_message
  end
  alias_method_chain :full_message, :html_safe


  #
  # Code below is used to allow empty messages
  # This is useful to set errors for fields (add error class) without showing an actual message
  #

  # Overwrite full_messages such that false messages are not displayed
  def full_messages
    reject { |attribute, message| message == false }.map { |attribute, message| full_message(attribute, message) }
  end
  
  # Overwrite normalize_message implementation with the Rails 4.1 way so we can add false as message
  def normalize_message(attribute, message, options)
    case message
    when Symbol
      generate_message(attribute, message, options.except(*CALLBACKS_OPTIONS))
    when Proc
      message.call
    else
      message
    end
  end

  # Empty messages for an attribute. This removes all errors and sets a new error with empty message if the attribute had errors
  def empty_messages(attribute)
    if self[attribute].present?
      # There were errors
      self[attribute].clear
      self.add(attribute, false)
    end
  end
end