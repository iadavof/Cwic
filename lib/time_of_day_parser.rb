module TimeOfDayParser
  include I18n::Alchemy::DateParser
  extend  self

  def localize(value)
    valid_for_localization?(value) ? value.strftime(i18n_format) : value
  end

  protected

  def build_object(parsed_date)
    TimeOfDay.new(*parsed_date.values_at(:hour, :min, :sec))
  end

  def i18n_scope
    :time_of_day
  end

  def valid_for_localization?(value)
    value.is_a?(Time)
  end
end
