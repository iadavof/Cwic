module I18n
  module Alchemy
    class Proxy
      def detect_parser(type_or_parser)
        case type_or_parser
        when :number
          # number parser is deliberately removed, since we do not want to parse numbers anymore, because we use the new HTML5 number fields (which use unlocalized values)
        when :date
          DateParser
        when :datetime, :timestamp
          TimeParser
        when :time, :tod, :timeofday
          TimeOfDayParser # Recognize our TimeOfDay parser
        when ::Module
          type_or_parser
        end
      end
    end
  end
end

