class MyOrganisationsController < CrudController
  private

  def model
    Organisation
  end

  def permitted_params
    [:name, :phone_general, :phone_reservations, :route, :street_number, :locality, :administrative_area_level_2, :administrative_area_level_1, :country, :postal_code, :address_type, :lng, :lat]
  end

  def redirect_location
    my_organisation_path(member)
  end
end
