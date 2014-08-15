class Users::RegistrationsController < DeviseInvitable::RegistrationsController
  before_action :configure_permitted_parameters

  def new
    build_resource({})
    self.resource.organisations.build(params[:organisations])
    respond_with self.resource
  end

 protected
  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:sign_up) { |u| u.permit(:first_name, :last_name, :infix, :email, :password, :password_confirmation, organisations_attributes: [:name,:route, :street_number, :locality, :administrative_area_level_2, :administrative_area_level_1, :country, :postal_code, :address_type, :lng, :lat]) }
  end
end