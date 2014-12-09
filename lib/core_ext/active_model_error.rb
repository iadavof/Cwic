class ActiveModel::Errors
  # Support errors without message (message is false)
  # This is useful to set errors for fields (add error class) without showing an actual message

  # Overwrite full_messages such that false messages are not displayed
  def full_messages
    reject { |attribute, message| message == false }.map { |attribute, message| full_message(attribute, message) }
  end

  # Empty messages for an attribute. This removes all errors and sets a new error with empty message if the attribute had errors
  def empty_messages(attribute)
    return unless self[attribute].present?
    # There were errors
    self[attribute].clear
    add(attribute, false)
  end

  # Allow html_safe error messages (e.g. to add links in error messages)

  def full_message_with_html_safe(attribute, message)
    full_message = full_message_without_html_safe(attribute, message)
    message.html_safe? ? full_message.html_safe : full_message
  end
  alias_method_chain :full_message, :html_safe
end
