class HomeController < ApplicationController
  has_widgets do |root|
    root << widget(:new_reservations, organisation: current_organisation)
  end

  def index
    render
  end
end
