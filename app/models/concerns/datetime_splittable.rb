# Splits an ActiveRecord DateTime/Timestamp into a date and tod (TimeOfDay)
module DatetimeSplittable
  extend ActiveSupport::Concern

  module ClassMethods
    def split_datetime(*args)
      options = args.extract_options!
      options[:default] = Time.now unless options.key?(:default)

      args.each do |attribute|
        required = options[:required] || attribute_required?(attribute)
        define_method("#{attribute}_date") { self.get_date(attribute) }
        define_method("#{attribute}_tod") { self.get_tod(attribute) }
        define_method("#{attribute}_date=") { |date| self.set_date(attribute, date) }
        define_method("#{attribute}_tod=") { |tod| self.set_tod(attribute, tod) }
        define_method("set_default_#{attribute}") { self.send("#{attribute}=", options[:default]) }
        define_method("join_#{attribute}") { self.join_date_and_tod(attribute) }
        define_method("correct_errors_#{attribute}") { self.correct_errors_date_and_tod(attribute) }

        localize "#{attribute}_date", using: :date
        localize "#{attribute}_tod", using: TimeOfDayParser

        if required
          validates "#{attribute}_date", presence: { message: :date_blank }
          validates "#{attribute}_tod", presence: { message: :tod_blank }
        end
        validates "#{attribute}_date", date: true, if: "#{attribute}_date.present?"
        validates "#{attribute}_tod", time_of_day: true, if: "#{attribute}_tod.present?"

        after_initialize "set_default_#{attribute}", if: :new_record?
        before_validation "join_#{attribute}"
        after_validation "correct_errors_#{attribute}"
      end
    end

    # Check if there is a presence validator on the attribute
    # Note: this method only works for static validations (i.e. it does not take conditions into account).
    def attribute_required?(attribute)
      self.validators_on(attribute).each do |validator|
        return true if validator.is_a?(ActiveModel::Validations::PresenceValidator)
      end
    end
  end

protected
  def get_date(attribute)
    date = instance_variable_get("@#{attribute}_date")
    time = self.send(attribute)
    return date unless date.nil?
    return time.to_date if time.present?
  end

  def get_tod(attribute)
    tod = instance_variable_get("@#{attribute}_tod")
    time = self.send(attribute)
    return tod unless tod.nil?
    return time.to_time.to_tod if time.present?
  end

  def set_date(attribute, date)
    begin
      date = (date.present? ? date.to_date : date)
    rescue ArgumentError
    end
    instance_variable_set("@#{attribute}_date", date)
  end

  def set_tod(attribute, tod)
    begin
      tod = (tod.present? ? tod.to_tod.utc : tod)
    rescue ArgumentError, NoMethodError
    end
    instance_variable_set("@#{attribute}_tod", tod)
  end

  def set_date_and_tod(attribute, time)
    instance_variable_set("@#{attribute}_date", time.to_date)
    instance_variable_set("@#{attribute}_tod", time.to_tod)
  end

  def join_date_and_tod(attribute)
    date = instance_variable_get("@#{attribute}_date")
    tod = instance_variable_get("@#{attribute}_tod")
    if date.is_a?(Date) && tod.is_a?(TimeOfDay)
      # Only if both are set, create time from them. Otherwise leave the old time standing.
      time = Time.new(date.year, date.month, date.day, tod.hour, tod.min, tod.sec).utc
      self.send("#{attribute}=", time)
    end
  end

  # Correct errors on date and time field, so everything is nicely displayed
  def correct_errors_date_and_tod(attribute)
    if self.errors["#{attribute}_date"].present? || self.errors["#{attribute}_tod"].present?
      # Validation of the sub attributes failed:
      self.errors[attribute].clear # Move errors from Clear all errors on the base attribute, since they are probably invalid.
      self.errors.set(attribute, self.errors["#{attribute}_date"] + self.errors["#{attribute}_tod"]) # Copy the errors of the sub attributes to the base attribute.
      self.errors.empty_messages("#{attribute}_date") # Remove the error messages on the date sub attribute
      self.errors.empty_messages("#{attribute}_tod") # Remove the error messages on the time sub attribute
    elsif self.errors[attribute].present?
      # There is an error on the base attribute. Set the error (without message) on the sub attributes as well.
      self.errors.add("#{attribute}_date", false)
      self.errors.add("#{attribute}_tod", false)
    end
  end
end