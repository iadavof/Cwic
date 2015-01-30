class MyUsersController < CrudController
  def edit_password
    respond_with(@user)
  end

  def update_password
    @user.update_with_password(params.require(:user).permit(:current_password, :password, :password_confirmation))
    respond_with(@user, action: :edit_password, location: respond_location)
  end

  def edit_email
    @user.email = @user.unconfirmed_email if @user.unconfirmed_email.present?
    respond_with(@user)
  end

  def update_email
    @user.update_with_password(params.require(:user).permit(:current_password, :email))
    respond_with(@user, action: :edit_email, location: respond_location)
  end

  private

  def model
    User
  end

  def permitted_params
    [:first_name, :last_name, :infix]
  end

  def respond_location
    my_user_path(member)
  end
end
