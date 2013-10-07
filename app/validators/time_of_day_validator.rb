class TimeOfDayValidator < ActiveModel::EachValidator
  def validate_each(record, attr_name, value)
    record.errors.add(attr_name, :not_a_tod, options.merge(value: value)) unless value.is_a?(TimeOfDay)
  end
end