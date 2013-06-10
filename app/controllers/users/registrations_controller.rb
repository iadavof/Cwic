class Users::RegistrationsController < Devise::RegistrationsController
  before_action :configure_permitted_parameters

  def new
    resource = build_resource({})
    resource.organisations.build
    respond_with resource
  end

  def create
    resource = build_resource(params[:user])

    if(resource.save)
      sign_in(resource_name, resource)
      respond_with resource, location: after_sign_up_path_for(resource)
    else
      render :action => "new"
    end
  end

 protected
  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:sign_up) { |u| u.permit(:first_name, :last_name, :infix, :email, :password, :organisations_attributes) }
  end
end