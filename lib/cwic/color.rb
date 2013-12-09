module Cwic::Color
  class << self
    def text_color(bg_color, text_colors = ['#000000', '#ffffff'], diff_algorithm = :brightness_difference)
      max = nil # [max_distance, color]
      text_colors.each do |color|
        d = send(diff_algorithm, bg_color, color)
        if max.nil? || d > max[0]
          max = [d, color]
        end
      end
      max[1]
    end

    def brightness_difference(color1, color2)
      color1 = hex_to_rgb(color1)
      color2 = hex_to_rgb(color2)
      br1 = (299 * color1[0] + 587 * color1[1] + 114 * color1[2]) / 1000
      br2 = (299 * color2[0] + 587 * color2[1] + 114 * color2[2]) / 1000
      (br1-br2).abs
    end

    def random_hex_color
      r = rand(255).to_s(16)
      g = rand(255).to_s(16)
      b = rand(255).to_s(16)

      r, g, b = [r, g, b].map { |s| if s.size == 1 then '0' + s else s end }

      '#' + r + g + b
    end

     def hex_to_rgb(color)
      color = color[1..7] if color[0] == '#'
      color.scan(/../).map { |c| c.to_i(16) }
    end
  end
end