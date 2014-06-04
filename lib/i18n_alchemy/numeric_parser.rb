module I18n
  module Alchemy
    module NumericParser
      extend self

      def parse(value)
        Float(value).to_f rescue super(value)
      end
    end
  end
end
