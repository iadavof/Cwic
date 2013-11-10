class OrganisationUsersController < ApplicationController
  before_action :load_resource
  authorize_resource through: :organisation

  # GET /organisation_users
  def index
    respond_with(@organisation_users)
  end

  # GET /organisation_users/new
  def new
    respond_with(@organisation_user)
  end

  # GET /organisation_users/1/edit
  def edit
    respond_with(@organisation_user)
  end

  # POST /organisation_users
  def create
    # Enable user lookup by email
    @organisation_user.by_email = true
    @organisation_user.attributes = resource_params
    if @organisation_user.valid? && @organisation_user.user.nil?
      # Organisation user is valid, but user could not be found: render the invitation form for the new user. No need to save the organisation user, this will be done after the invitation is sent (and the user is created).
      @user = User.new
      @user.email = @organisation_user.user_email
      @user.organisation_users << @organisation_user
      render :new_invitation
    else
      # User with e-mail already exists: try to save the organisation user and render the normal response.
      # The before_validation will automatically set the user based on the user_email field.
      @organisation_user.save
      respond_with(@organisation, @organisation_user, location: organisation_organisation_users_path(@organisation))
    end
  end

  def send_invitation
    @current_menu_link = :create # Set current_menu_link to create, since we actually are still creating a new organisation user.
    # The invite call on the user will also calls the save method on this user object and stores the organisation_users relation
    @user = User.invite!(invite_params, current_user)
    if @user.valid?
      respond_with(@organisation, @organisation_user, location: organisation_organisation_users_path(@organisation))
    else
      render :new_invitation
    end
  end

  def resend_invitation
    @organisation_user.user.invite!
    respond_with(@organisation, @organisation_user, location: organisation_organisation_users_path(@organisation))
  end

  # PATCH/PUT /organisation_users/1
  def update
    @organisation_user.update_attributes(resource_params)
    respond_with(@organisation, @organisation_user, location: organisation_organisation_users_path(@organisation))
  end

  # DELETE /organisation_users/1
  def destroy
    @organisation_user.destroy
    respond_with(@organisation, @organisation_user, location: organisation_organisation_users_path(@organisation))
  end

private
  def load_resource
    case params[:action]
    when 'index'
      @organisation_users = @organisation.organisation_users.accessible_by(current_ability, :index)
    when 'new', 'create', 'send_invitation'
      @organisation_user = @organisation.organisation_users.build
    else
      @organisation_user = @organisation.organisation_users.find(params[:id])
    end
  end

  def resource_params
    params.require(:organisation_user).permit(:user_id, :user_email, :organisation_id, :organisation_role_id)
  end

  def invite_params
    params.require(:user).permit(:first_name, :infix, :last_name, :email, :invitation_token, organisation_users_attributes: [:organisation_id, :organisation_role_id])
  end

  def interpolation_options
    user = (params[:action] == 'send_invitation' ? @user : @organisation_user.user)
    if user.present?
      { resource_name: user.instance_name, resource_email: user.email }
    else
      {}
    end
  end
end
