class MyUsersController < CrudController
  def edit_password
    respond_with(@user)
  end

  def update_password
    @user.validate_current_password = true
    @user.update(member_params)
    respond_with(@user, action: :edit_password, location: respond_location)
  end

  def edit_email
    @user.email = @user.unconfirmed_email if @user.unconfirmed_email.present?
    respond_with(@user)
  end

  def update_email
    @user.validate_current_password = true
    @user.update(member_params)
    respond_with(@user, action: :edit_email, location: respond_location)
  end

  private

  def model
    User
  end

  def permitted_params
    [:first_name, :last_name, :infix, :email, :current_password, :password, :password_confirmation]
  end

  def respond_location
    my_user_path(member)
  end
end
