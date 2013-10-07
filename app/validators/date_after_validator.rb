class DateAfterValidator < ActiveModel::EachValidator
  def validate_each(record, attr_name, value)
    error_options = {}
    case options[:date]
    when nil
      date = DateTime.now
      error = :date_must_be_in_future
    when Symbol
      date = record[options[:date]]
      return if date.nil?
      error = :date_must_be_after_attribute
      error_options = { attribute_name: record.class.human_attribute_name(options[:date]).lcfirst, formatted_date: I18n.l(date, format: options[:date_error_format]) }
    else
      date = options[:date]
      error = :date_must_be_after_date
      error_options = { formatted_date: I18n.l(date, format: options[:date_error_format]) }
    end
    return if value.nil? || date.nil?
    record.errors.add(attr_name, error, options.merge(error_options)) if value < date
  end
end