module AutoNormalizable
  extend ActiveSupport::Concern

  included do
    normalize_attributes *columns.select { |c| c.type == :string }.map(&:name)
  end
end
