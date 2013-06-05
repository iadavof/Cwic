<% if namespaced? -%>
require_dependency "<%= namespaced_file_path %>/application_controller"

<% end -%>
<% module_namespacing do -%>
class <%= controller_class_name %>Controller < ApplicationController
  before_action :load_resource
  authorize_resource

  # GET <%= route_url %>
  def index
    respond_with(@<%= plural_table_name %>)
  end

  # GET <%= route_url %>/1
  def show
    respond_with(@<%= singular_table_name %>)
  end

  # GET <%= route_url %>/new
  def new
    respond_with(@<%= singular_table_name %>)
  end

  # GET <%= route_url %>/1/edit
  def edit
    respond_with(@<%= singular_table_name %>)
  end

  # POST <%= route_url %>
  def create
<% if attributes.select { |attr| [:integer, :float, :decimal].include?(attr.type) }.present? -%>
    @<%= singular_table_name %>.localized.attributes = resource_params
<% else -%>
    @<%= singular_table_name %>.attributes = resource_params
<% end -%>
    @<%= singular_table_name %>.save
    respond_with(@<%= singular_table_name %>)
  end

  # PATCH/PUT <%= route_url %>/1
  def update
<% if attributes.select { |attr| [:integer, :float, :decimal].include?(attr.type) }.present? -%>
    @<%= singular_table_name %>.localized.update_attributes(resource_params)
<% else -%>
    @<%= singular_table_name %>.update_attributes(resource_params)
<% end -%>
    respond_with(@<%= singular_table_name %>)
  end

  # DELETE <%= route_url %>/1
  def destroy
    @<%= orm_instance.destroy %>
    respond_with(@<%= singular_table_name %>)
  end

private
  def load_resource
    case params[:action]
    when 'index'
      @<%= plural_table_name %> = <%= class_name %>.accessible_by(current_ability, :index)
    when 'new', 'create'
      @<%= singular_table_name %> = <%= class_name %>.new
    else
      @<%= singular_table_name %> = <%= class_name %>.find(params[:id])
    end
  end

  # Only allow a trusted parameter "white list" through.
  def resource_params
<%- if attributes_names.empty? -%>
    params[<%= ":#{singular_table_name}" %>]
<%- else -%>
    params.require(<%= ":#{singular_table_name}" %>).permit(<%= attributes_names.map { |name| ":#{name}" }.join(', ') %>)
<%- end -%>
  end

  def interpolation_options
    { resource_name: @<%= singular_table_name %>.instance_name }
  end
end
<% end -%>