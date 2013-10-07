class DateValidator < ActiveModel::EachValidator
  def validate_each(record, attr_name, value)
    record.errors.add(attr_name, :not_a_date, value: value) unless value.is_a?(Date)
  end
end