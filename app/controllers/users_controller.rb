class UsersController < CrudController

  private

  def permitted_params
    [:first_name, :last_name, :infix, :email, :password]
  end
end
