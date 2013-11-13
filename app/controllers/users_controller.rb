class UsersController < ApplicationController
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

  # GET /users/1/edit
  def edit
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
      @users = User.accessible_by(current_ability, :index).page(params[:page])
      # if no results, check if not a page is selected that does not exist
      unless @users.present?
        @users = User.accessible_by(current_ability, :index).page(1)
      end
    else
      @user = User.find(params[:id])
    end
  end

  # Only allow a trusted parameter "white list" through.
  def user_params
    params.require(:user).permit(:first_name, :last_name, :infix, :email)
  end

  def interpolation_options
    { resource_name: @user.instance_name }
  end
end
