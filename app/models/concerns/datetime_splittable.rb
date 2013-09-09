# Splits an ActiveRecord DateTime/Timestamp into a date and tod (TimeOfDay)
module DatetimeSplittable
  extend ActiveSupport::Concern

  module ClassMethods
    def split_datetime(*attributes)
      attributes.each do |attribute|
        define_method("#{attribute}_date") { self.get_date(attribute) }
        define_method("#{attribute}_tod") { self.get_tod(attribute) }
        define_method("#{attribute}_date=") { |date| self.set_date(attribute, date) }
        define_method("#{attribute}_tod=") { |tod| self.set_tod(attribute, tod) }
        define_method("join_#{attribute}") { self.join_date_and_tod(attribute) }
        before_validation("join_#{attribute}")
        localize "#{attribute}_date", using: :date
        localize "#{attribute}_tod", using: :time_of_day
      end
    end
  end

protected
  def get_date(attribute)
    date = instance_variable_get("@#{attribute}_date")
    time = self.send(attribute)
    return date if date.present?
    return time.to_date if time.present?
    return Date.today
  end

  def get_tod(attribute)
    tod = instance_variable_get("@#{attribute}_tod")
    time = self.send(attribute)
    return tod if tod.present?
    return time.to_tod if time.present?
    return TimeOfDay.now
  end

  def set_date(attribute, date)
    instance_variable_set("@#{attribute}_date", date.to_date)
  end

  def set_tod(attribute, tod)
    instance_variable_set("@#{attribute}_tod", tod.to_time.to_tod.utc)
  end

  def join_date_and_tod(attribute)
    date = instance_variable_get("@#{attribute}_date")
    tod = instance_variable_get("@#{attribute}_tod")
    if date.present? && tod.present?
      time = Time.new(date.year, date.month, date.day, tod.hour, tod.min, tod.sec).utc
      self.send("#{attribute}=", time)
    end
  end
end