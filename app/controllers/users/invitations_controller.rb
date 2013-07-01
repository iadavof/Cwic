class Users::InvitationsController < Devise::InvitationsController
  before_action :configure_permitted_parameters

  # GET /resource/invitation/new
  def new
    # Disabled. This is handled in organisation_users controller.
    return
  end

  # POST /resource/invitation
  def create
    # Disabled. This is handled in organisation_users controller.
    return
  end

  protected
  def update_resource_params
    devise_parameter_sanitizer.for(:accept_invitation)
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:accept_invitation) { |u| u.permit(:first_name, :infix, :last_name, :password, :password_confirmation, :invitation_token) }
  end
end

