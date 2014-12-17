module FrontMatter
  extend ActiveSupport::Concern

  included do
    before_action :load_frontend
    before_action :load_organisation
    skip_before_action :authenticate_user!
    skip_around_action :set_current_user
    skip_around_action :set_current_organisation

    layout 'frontend'

    helper_method :current_organisation
    helper_method :current_frontend
  end

  def load_frontend
    if params[:frontend_id].present?
      frontend_id = params[:frontend_id]
    elsif session[:current_frontend_id].present?
      frontend_id = session[:current_frontend_id]
    end

    session[:current_frontend_id] = frontend_id if frontend_id.present?
    @frontend = Frontend.find(frontend_id) if frontend_id.present?
  end

  def load_organisation
    @organisation = @frontend.organisation if @frontend.organisation.present?
  end

  def current_organisation
    @organisation
  end

  def current_frontend
    @frontend
  end

  def after_sign_in_path_for(resource)
    front_frontend_path(@frontend)
  end

  def after_sign_up_path_for(resource)
    front_frontend_path(@frontend)
  end
  def after_inactive_sign_up_path_for(resource)
    front_frontend_path(@frontend)
  end
end
