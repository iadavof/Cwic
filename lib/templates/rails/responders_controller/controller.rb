<% if namespaced? -%>
require_dependency "<%= namespaced_file_path %>/application_controller"

<% end -%>
<% module_namespacing do -%>
class <%= controller_class_name %>Controller < CrudController

private
<%- unless attributes_names.empty? -%>
  def permitted_params
    [<%= attributes_names.map { |name| ":#{name}" }.join(', ') %>]
  end
<%- end -%>
end
<% end -%>
