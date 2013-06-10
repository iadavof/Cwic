require "application_responder"

class ApplicationController < ActionController::Base
  before_action :authenticate_user!
  check_authorization unless :devise_controller?

  before_action :load_organisation

  self.responder = ApplicationResponder
  respond_to :html

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  rescue_from CanCan::AccessDenied do |exception|
    redirect_to root_url, alert: exception.message
  end

  def current_organisation
    current_user.organisations.first if current_user.present? # XXX TODO this should return the currently selected organisation
  end
  helper_method :current_organisation

  def load_organisation
    @organisation = Organisation.find(params[:organisation_id]) if params[:organisation_id].present?
  end
end
