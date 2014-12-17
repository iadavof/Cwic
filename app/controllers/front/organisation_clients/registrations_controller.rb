class Front::OrganisationClients::RegistrationsController < Devise::RegistrationsController
  include FrontMatter
  before_action :configure_permitted_parameters
  before_action :disable, if: -> { Rails.application.config.disable_registrations }

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:sign_up) { |u| u.permit(:first_name, :last_name, :infix, :email, :password, :password_confirmation) }
  end

  def disable
    redirect_to front_frontend_path(current_frontend), alert: I18n.t('devise.registrations.disabled')
  end

  def build_resource(hash=nil)
    self.resource = resource_class.new_with_session(hash || {}, session)
    self.resource.organisation = current_organisation
  end
end
