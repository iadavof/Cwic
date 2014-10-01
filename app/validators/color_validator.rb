class ColorValidator < ActiveModel::EachValidator
  COLORS = ['aqua', 'black', 'blue', 'fuchsia', 'gray', 'green', 'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 'silver', 'teal', 'white', 'yellow']

  def validate_each(record, attribute, value)
    record.errors.add(attribute, (options[:message] || default_error_message(value))) unless valid_color?(value)
  end

  def default_error_message(value)
    I18n.t('errors.messages.invalid_color', value: value, valid_colors: COLORS.to_sentence(two_words_connector: I18n.t('support.array.two_words_connector_or'), last_word_connector: I18n.t('support.array.last_word_connector_or')))
  end

  def valid_color?(value)
    if value.nil? || value.empty?
      false
    elsif value =~ /\A#(?=[A-Fa-f0-9])(?:.{3}|.{6})\z/i
      # Value is a color code
      true
    elsif COLORS.include?(value.downcase)
      # Value is a valid color string
      true
    else
      # Color is not valid
      false
    end
  end
end
