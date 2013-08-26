class Reservation < ActiveRecord::Base
  belongs_to :organisation_client
  belongs_to :entity
  belongs_to :organisation

  validates :begins_at, presence: true
  validates :ends_at, presence: true, date_after: { date: :begins_at, date_error_format: :long }
  validates :entity, presence: true
  validates :organisation_client, presence: true

  attr_accessor :begins_at_date, :begins_at_time, :ends_at_date, :ends_at_time

  before_validation :make_begins_at, :make_ends_at

  after_save :trigger_day_occupation_recalculation
  after_destroy :trigger_day_occupation_recalculation

  def instance_name
    "#{self.class.model_name.human} ##{self.id.to_s}"
  end

  def make_begins_at
    if @begins_at_date.present? && @begins_at_time.present?
      puts self.begins_at.inspect
      self.begins_at = Time.new(@begins_at_date.year, @begins_at_date.month, @begins_at_date.day, @begins_at_time.hour, @begins_at_time.min).utc
      puts self.begins_at.inspect
    end
  end

  def make_ends_at
    if @ends_at_date.present? && @ends_at_time.present?
      self.ends_at = Time.new(@ends_at_date.year, @ends_at_date.month, @ends_at_date.day, @ends_at_time.hour, @ends_at_time.min).utc
    end
  end

  def begins_at_date
    return @begins_at_date if @begins_at_date.present?
    return begins_at.to_date if begins_at.present?
    return Date.today
  end

  def begins_at_time
    return @begins_at_time if @begins_at_time.present?
    return begins_at.to_time if begins_at.present?
    return Time.now
  end

  def ends_at_date
    return @ends_at_date if @ends_at_date.present?
    return ends_at.to_date if ends_at.present?
    return Date.today
  end

  def ends_at_time
    return @ends_at_time if @ends_at_time.present?
    return ends_at.to_time if ends_at.present?
    return Time.now
  end


  def begins_at_date=(new_date)
    @begins_at_date = self.string_to_datetime(new_date, I18n.t('date.formats.default')).to_date
  end


  def begins_at_time=(new_time)
    puts new_time.inspect
    @begins_at_time = self.string_to_datetime(new_time, I18n.t('time.formats.time')).to_time.utc
    puts @begins_at_time.inspect
  end

  def ends_at_date=(new_date)
    @ends_at_date = self.string_to_datetime(new_date, I18n.t('date.formats.default')).to_date
  end


  def ends_at_time=(new_time)
    @ends_at_time = self.string_to_datetime(new_time, I18n.t('time.formats.time')).to_time.utc
  end


  def length_for_day(day)
    if day < self.begins_at.to_date || day > self.ends_at.to_date
      return 0
    elsif day < self.ends_at.to_date && day == self.begins_at.to_date
      return (day + 1.day).to_time - self.begins_at
    elsif day > self.begins_at.to_date && day == self.ends_at.to_date
      return self.ends_at - day.to_time
    elsif day == self.begins_at.to_date && day == self.ends_at.to_date
      return self.ends_at - self.begins_at
    else
      return 86400
    end
  end

  protected

  def trigger_day_occupation_recalculation
    recalculation_dates = []

    # Old values
    if self.begins_at_was.present? && self.ends_at_was.present?
      if self.begins_at_was.to_date != self.begins_at.to_date || self.ends_at_was.to_date != self.ends_at.to_date
        start_date = self.begins_at_was.to_date
        while start_date <= self.ends_at_was.to_date
          recalculation_dates << start_date
          start_date += 1.day
        end
      end
    end

    start_date = self.begins_at.to_date
    while start_date <= self.ends_at.to_date
      unless recalculation_dates.include?(start_date)
        recalculation_dates << start_date
      end
      start_date += 1.day
    end

    DayOccupation.recalculate_occupations(self.entity, recalculation_dates)
  end

  def string_to_datetime(value, format)
    return value unless value.is_a?(String)

    begin
      DateTime.strptime(value, format)
    rescue ArgumentError
      nil
    end
  end

end
