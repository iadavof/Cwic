class Front::OrganisationClients::SessionsController < Devise::SessionsController
  include FrontMatter
  before_action :disable, if: -> { Rails.application.config.disable_sessions }

  protected

  def disable
    redirect_to :root, alert: I18n.t('devise.sessions.disabled')
  end
end
