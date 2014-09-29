class OrganisationUsersController < CrudController
  skip_before_action :load_member, only: :invite

  def create
    @organisation_user.by_email = true # Enable user lookup by email
    if @organisation_user.valid? && @organisation_user.user.nil?
      # Organisation user is valid, but user could not be found: render the invitation form for the new user.
      # User will be created after the invitation is sent.
      @user = User.new
      @user.email = @organisation_user.user_email
      @user.organisation_users << @organisation_user
      render :invite_form
    else
      # User with e-mail already exists: try to save the organisation user and render the normal response.
      # The before_validation will automatically set the user based on the user_email field.
      super
    end
  end

  def invite
    @current_menu_link = :create # Set current_menu_link to create, since we actually are still creating a new organisation user.
    # The invite call on the user will also calls the save method on this user object and stores the organisation_users relation
    @user = User.invite!(invite_params, current_user)
    respond_with(@organisation, @user, action: :invite_form, location: redirect_location)
  end

  def reinvite
    @organisation_user.user.invite!
    respond_with(@organisation, @organisation_user, location: redirect_location)
  end

  private

  def parent_model
    Organisation
  end

  def permitted_params
    [:user_id, :user_email, :organisation_id, :organisation_role_id]
  end

  def invite_params
    params.require(:user).permit(:first_name, :infix, :last_name, :email, :invitation_token, organisation_users_attributes: [:organisation_id, :organisation_role_id])
  end

  def redirect_location
    collection_path
  end

  def interpolation_options
    user = (params[:action] == 'invite' ? @user : @organisation_user.user)
    if user.present?
      { resource_name: user.instance_name, resource_email: user.email }
    else
      {}
    end
  end
end
