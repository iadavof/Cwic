class CommunicationRecordsController < CrudController
  before_action :set_menu

  private

  def parent_model
    OrganisationClient
  end

  def parent_path
    [@organisation, @organisation_client]
  end

  def respond_location
    collection_path
  end

  def permitted_params
    [:method, :emotion, :summary, :contact_id, :reservation_id]
  end

  def set_menu
    @current_menu_sub_category = :organisation_clients
    @current_menu_link = :show
  end
end
