class Users::RegistrationsController < DeviseInvitable::RegistrationsController
  before_action :configure_permitted_parameters

  def new
    build_resource({})
    self.resource.organisations.build(params[:organisations])
    respond_with self.resource
  end

 protected
  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:sign_up) { |u| u.permit(:first_name, :last_name, :infix, :email, :password, :password_confirmation, organisations_attributes: [:name, :street, :house_number, :postal_code, :city, :country]) }
  end

private
  def after_sign_in_path_for(resource_or_scope)
    new_user_session_path
  end
end