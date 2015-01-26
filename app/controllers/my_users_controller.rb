class MyUsersController < CrudController
  # TODO: Copy update_password/update_email structure from Saus (uses respond_with better, jo)
  def edit_password
    respond_with(@user)
  end

  def update_password
    @user.validate_current_password = true
    @user.update(member_params)
    respond_with(@user, location: respond_location) do |format|
      if @user.valid?
        sign_in(@user, bypass: true)
        flash[:notice] = t('my_users.update_password.success')
      else
        flash[:alert] = t('my_users.update_password.failure')
        format.html { render 'edit_password' }
      end
    end
  end

  def edit_email
    @user.email = @user.unconfirmed_email if @user.unconfirmed_email.present?
    respond_with(@user)
  end

  def update_email
    @user.validate_current_password = true
    @user.update(member_params)
    respond_with(@user, location: respond_location) do |format|
      if @user.valid?
        flash[:notice] = t('my_users.update_email.success')
      else
        flash[:alert] = t('my_users.update_email.failure')
        format.html { render 'edit_email' }
      end
    end
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
