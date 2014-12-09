# Splits an ActiveRecord DateTime/Timestamp into a date and tod (TimeOfDay)
# TODO: remove dependency on I18n::Alchemy (so we can remove this gem completely). See solution in Saus.
module DatetimeSplittable
  extend ActiveSupport::Concern

  module ClassMethods
    def split_datetime(*args)
      options = args.extract_options!
      options[:default] = Time.now unless options.key?(:default)

      args.each do |attribute|
        required = options[:required] || attribute_required?(attribute)
        define_method("#{attribute}_date") { get_date(attribute) }
        define_method("#{attribute}_tod") { get_tod(attribute) }
        define_method("#{attribute}_date=") { |date| set_date(attribute, date) }
        define_method("#{attribute}_tod=") { |tod| set_tod(attribute, tod) }
        define_method("set_default_#{attribute}") { send("#{attribute}=", options[:default]) if send(attribute).nil? }
        define_method("join_#{attribute}") { join_date_and_tod(attribute) }
        define_method("correct_errors_#{attribute}") { correct_errors_date_and_tod(attribute) }

        localize "#{attribute}_date", using: :date
        localize "#{attribute}_tod", using: :tod

        validates "#{attribute}_date", timeliness: { type: :date }, allow_blank: !required
        validates "#{attribute}_tod", timeliness: { type: :time }, allow_blank: !required

        after_initialize "set_default_#{attribute}", if: :new_record?
        before_validation "join_#{attribute}"
        after_validation "correct_errors_#{attribute}"
      end
    end

    # Check if there is a presence validator on the attribute
    # Note: this method only works for static validations (i.e. it does not take conditions into account).
    def attribute_required?(attribute)
      validators_on(attribute).each do |validator|
        return true if validator.is_a?(ActiveModel::Validations::PresenceValidator)
      end
    end
  end

  protected

  def get_date(attribute)
    date = instance_variable_get("@#{attribute}_date")
    time = send(attribute)
    return date unless date.nil?
    return time.to_date if time.present?
  end

  def get_tod(attribute)
    tod = instance_variable_get("@#{attribute}_tod")
    time = send(attribute)
    return tod unless tod.nil?
    return time.to_time.to_tod if time.present?
  end

  def set_date(attribute, date)
    begin
      # Use present construction instead of try, because empty string should return empty string (instead of nil)
      date = (date.present? ? date.to_date : date)
    rescue ArgumentError
      date = date # Could not parse: keep old value
    end
    instance_variable_set("@#{attribute}_date", date)
  end

  def set_tod(attribute, tod)
    begin
      # Use present construction instead of try, because empty string should return empty string (instead of nil)
      tod = (tod.present? ? tod.to_tod : tod)
    rescue ArgumentError
      tod = tod # Could not parse: keep old value
    end
    instance_variable_set("@#{attribute}_tod", tod)
  end

  def join_date_and_tod(attribute)
    date = get_date(attribute)
    tod = get_tod(attribute)
    return unless date.is_a?(Date) && tod.is_a?(TimeOfDay)

    # Only if both are set, create time from them. Otherwise leave the old time standing.
    time = Time.new(date.year, date.month, date.day, tod.hour, tod.min, tod.sec).utc
    send("#{attribute}=", time)
    # We have combine the separate date and tod fields into a time object, so we can unset the separate values.
    send("#{attribute}_date=", nil)
    send("#{attribute}_tod=", nil)
  end

  # Correct errors on date and time field, so everything is nicely displayed
  def correct_errors_date_and_tod(attribute)
    if errors["#{attribute}_date"].present? || errors["#{attribute}_tod"].present?
      # Validation of the sub attributes failed:
      errors[attribute].clear # Move errors from Clear all errors on the base attribute, since they are probably invalid.
      errors.set(attribute, errors["#{attribute}_date"] + errors["#{attribute}_tod"]) # Copy the errors of the sub attributes to the base attribute.
      errors.empty_messages("#{attribute}_date") # Remove the error messages on the date sub attribute
      errors.empty_messages("#{attribute}_tod") # Remove the error messages on the time sub attribute
    elsif errors[attribute].present?
      # There is an error on the base attribute. Set the error (without message) on the sub attributes as well.
      errors.add("#{attribute}_date", false)
      errors.add("#{attribute}_tod", false)
    end
  end
end
