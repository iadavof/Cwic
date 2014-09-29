<% if namespaced? -%>
require_dependency "<%= namespaced_file_path %>/application_controller"

<% end -%>
<% module_namespacing do -%>
class <%= controller_class_name %>Controller < CrudController
<%- unless attributes_names.empty? -%>
  private

  def permitted_params
    [<%= attributes_names.map { |name| ":#{name}" }.join(', ') %>]
  end
<%- end -%>
end
<% end -%>
