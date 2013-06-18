class DataType < ActiveRecord::Base
  validates :key, presence: true, length: { maximum: 255 }
  validates :rails_type, presence: true, length: { maximum: 255 }
  validates :form_type, presence: true, length: { maximum: 255 }

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
