class Front::OrganisationClientsController < CrudController

  include FrontMatter

  private

  def find_member
    current_organisation_client
  end

end
