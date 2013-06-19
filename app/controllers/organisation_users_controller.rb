class OrganisationUsersController < ApplicationController
  before_action :load_resource
  authorize_resource through: :organisation

  # GET /organisation_users
  def index
    respond_with(@organisation_users)
  end

  # GET /organisation_users/new
  def new
    if params[:email].present?
      @new_user = User.find_by_email(params[:email])
      if @new_user.present?
        @organisation_user.user = @new_user
        respond_with(@organisation_user)
      else
        redirect_to new_user_invitation_path({organisation: @organisation, email: params[:email]})
      end
    else
      redirect_to action: 'index'
    end
  end

  # GET /organisation_users/1/edit
  def edit
    respond_with(@organisation_user)
  end

  # POST /organisation_users
  def create
    @organisation_user.attributes = resource_params
    @organisation_user.save
    if @organisation_user.errors[:user].present?
      flash[:notice] = t('.user_already_has_a_role_in_organisation')
      redirect_to organisation_organisation_users_path(@organisation_user.organisation)
    else
      respond_with(@organisation, @organisation_user, location: organisation_organisation_users_path(@organisation))
    end
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
      @organisation_users = @organisation.organisation_users.accessible_by(current_ability, :index).where.not(user: current_user)
    when 'new', 'create'
      @organisation_user = @organisation.organisation_users.build
    else
      @organisation_user = @organisation.organisation_users.find(params[:id])
    end
  end

  def resource_params
    params.require(:organisation_user).permit(:user_id, :organisation_id, :organisation_role_id)
  end

  def interpolation_options
    { resource_name: @organisation_user.instance_name }
  end
end
