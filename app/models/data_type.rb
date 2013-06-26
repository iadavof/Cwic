class DataType < ActiveRecord::Base
  validates :key, presence: true, length: { maximum: 255 }
  validates :rails_type, presence: true, length: { maximum: 255 }
  validates :form_type, presence: true, length: { maximum: 255 }

  def cast_value(value)
    case self.rails_type
    when 'Integer'
      Integer(value)
    when 'BigDecimal'
      BigDecimal(value)
    when 'Boolean'
      ActiveRecord::ConnectionAdapters::Column.value_to_boolean(value)
    else
      value
    end
  end

  def format_value(value)
    case self.rails_type
    when 'Integer'
      I18n::Alchemy::NumericParser.localize(value)
    when 'BigDecimal'
      I18n::Alchemy::NumericParser.localize(value)
    when 'Boolean'
      I18n.t(value.to_s)
    else
      value
    end
  end

  def parse_value(value)
    case self.rails_type
    when 'Integer'
      parsed = (I18n::Alchemy::NumericParser.parse(value))
    when 'BigDecimal'
      parsed = (I18n::Alchemy::NumericParser.parse(value))
    else
      parsed = value
    end
    cast_value(parsed) rescue value
  end

  def human_name
    I18n.t("data_types.#{key}.name")
  end

  def human_description
    I18n.t("data_types.#{key}.description")
  end

  def instance_name
    self.key
  end
end
