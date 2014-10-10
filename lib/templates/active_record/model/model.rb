<% module_namespacing do -%>
class <%= class_name %> < <%= parent_class_name.classify %>
<% if attributes.select { |attr| [:date, :time, :datetime, :timestamp].include?(attr.type) }.present? -%>
  include I18n::Alchemy

<% end -%>
<% if attributes.select(&:reference?).any? -%>
  # Associations
<% attributes.select(&:reference?).each do |attribute| -%>
  belongs_to :<%= attribute.name %><%= ', polymorphic: true' if attribute.polymorphic? %>
<% end -%>

<% end -%>
<% if attributes.any? -%>
  # Validations
<% attributes.each do |attribute| -%>
<% if attribute.type == :string -%>
  validates :<%= attribute.name %>, presence: true, length: { maximum: 255 }
<% elsif attribute.type == :integer -%>
  validates :<%= attribute.name %>, presence: true, numericality: { only_integer: true }
<% elsif attribute.type == :decimal || attribute.type == :float -%>
  validates :<%= attribute.name %>, presence: true, numericality: true
<% else -%>
  validates :<%= attribute.name %>, presence: true
<% end -%>
<% end -%>

<% end -%>
<% if attributes.any?(&:password_digest?) -%>
  has_secure_password

<% end -%>
  def instance_name
<% if accessible_attributes.empty? -%>
    "#{self.class.model_name.human} #{id}"
<% else -%>
    <%= accessible_attributes.first.name %>
<% end -%>
  end
end
<% end -%>
