# Overwrite ActiveModel::Errors to support errors without message (message is false)
class ActiveModel::Errors
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