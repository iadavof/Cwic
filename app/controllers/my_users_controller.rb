class MyUsersController < CrudController
  private

  def model
    User
  end

  def permitted_params
    [:first_name, :last_name, :infix, :email]
  end

  def respond_location
    my_user_path(member)
  end
end
