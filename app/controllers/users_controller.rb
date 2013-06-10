class UsersController < ApplicationController
  before_action :get_organisation
  before_action :load_resource
  authorize_resource

  # GET /users
  def index
    respond_with(@users)
  end

  # GET /users/1
  def show
    respond_with(@user)
  end

  # GET /users/new
  def new
    respond_with(@user)
  end

  # GET /users/1/edit
  def edit
    respond_with(@user)
  end

  # POST /users
  def create
    @user.attributes = params[:user]
    @user.save
    respond_with(@user)
  end

  # PATCH/PUT /users/1
  def update
    @user.update_attributes(params[:user])
    respond_with(@user)
  end

  # DELETE /users/1
  def destroy
    @user.destroy
    respond_with(@user)
  end

private
  def load_resource
    case params[:action]
    when 'index'
      @users = @organisation.users.accessible_by(current_ability, :index)
    when 'new', 'create'
      @user = @organisations.build
    else
      @user = User.find(params[:id])
    end
  end

  # Only allow a trusted parameter "white list" through.
  def user_params
    params.require(:user).permit(:first_name, :last_name, :infix)
  end

  def interpolation_options
    { resource_name: @user.instance_name }
  end

  def load_forum
    @organisation = Organisation.find(params[:organisation_id]) if params[:organisation_id].present?
  end
end
