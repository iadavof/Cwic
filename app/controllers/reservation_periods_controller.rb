class ReservationPeriodsController < CrudController
  before_action :set_menu

  private

  def parent_model
    EntityType
  end

  def parent_path
    [@organisation, parent]
  end

  def respond_location
    collection_path
  end

  def permitted_params
    [:name, :period_amount, :period_unit_id, :min_periods, :max_periods, :price]
  end

  def set_menu
    @current_menu_sub_category = :entity_types
    @current_menu_link = :show
  end
end
