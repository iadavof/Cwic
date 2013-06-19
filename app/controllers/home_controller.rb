class HomeController < ApplicationController
  before_action { @current_menu_category = :overview }

  def index
  end
end
