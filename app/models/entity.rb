class Entity < ActiveRecord::Base
  belongs_to :entity_type, counter_cache: true
  belongs_to :organisation
  has_many :properties, class_name: 'EntityProperty', dependent: :destroy, inverse_of: :entity

  validates :name, presence: true, length: { maximum: 255 }
  validates :entity_type, presence: true
  validates :organisation, presence: true
  validates :color, color: true

  accepts_nested_attributes_for :properties, allow_destroy: true

  default_scope order('id ASC')

  def instance_name
    self.name
  end

  def color_luminosity_difference(color1, color2)
    color1 = hex_color_to_rgb(color1)
    color2 = hex_color_to_rgb(color2)
    l1 = 0.2126 * ((color1[0] / 225.0) ** 2.2) + 0.7152 * ((color1[1] / 225.0) ** 2.2) + 0.0722 * ((color1[2] / 225.0) ** 2.2)
    l2 = 0.2126 * ((color2[0] / 225.0) ** 2.2) + 0.7152 * ((color2[1] / 225.0) ** 2.2) + 0.0722 * ((color2[2] / 225.0) ** 2.2)
    if l1 > l2
      (l1 + 0.05) / (l2 + 0.05)
    else
      (l2 + 0.05) / (l1 + 0.05)
    end
  end

  def text_color
    max_d = 0
    max_color = nil
    colors = ['#444444', '#ffffff']
    colors.each do |color|
      d = color_luminosity_difference(self.color, color)
      if d > max_d
        max_d = d
        max_color = color
      end
    end
    max_color
  end

  def hex_color_to_rgb(color)
    color = color[1..7] if color[0] == '#'
    color.scan(/../).map { |c| c.to_i(16) }
  end
end
