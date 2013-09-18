<% module_namespacing do -%>
class <%= class_name %> < <%= parent_class_name.classify %>
<% if attributes.select { |attr| [:integer, :float, :decimal].include?(attr.type) }.present? -%>
  include I18n::Alchemy

<% end -%>
<% if attributes.select(&:reference?).any? -%>
<% attributes.select(&:reference?).each do |attribute| -%>
  belongs_to :<%= attribute.name %><%= ', polymorphic: true' if attribute.polymorphic? %>
<% end -%>

<% end -%>
<% if attributes.any? -%>
<% attributes.each do |attribute| -%>
<% if attribute.type == :string -%>
  validates :<%= attribute.name %>, presence: true, length: { maximum: 255 }
<% elsif attribute.type == :integer -%>
  validates :<%= attribute.name %>, presence: true, numericality: { only_integer: true }
<% elsif attribute.type == :decimal || attribute.type == :float -%>
  validates :<%= attribute.name %>, presence: true, numericality: true
<% elsif attribute.reference? -%>
  validates :<%= attribute.name %>_id, presence: true
  validates :<%= attribute.name %>, presence: true, if: "<%= attribute.name %>_id.present?"
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
    "#{self.class.model_name.human} #{self.id}"
<% else -%>
    self.<%= accessible_attributes.first.name %>
<% end -%>
  end
end
<% end -%>