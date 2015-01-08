class ReservationStatusesController < CrudController
  skip_before_action :load_member, only: :sort
  before_action :set_menu

  def sort
    @reservation_statuses.each do |rs|
      rs.set_list_position(params[:reservation_status].index(rs.id.to_s) + 1)
    end
    render nothing: true
  end

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
    [:name, :color, :index, :default_status, :blocking, :info_boards, :billable]
  end

  def set_menu
    @current_menu_sub_category = :entity_types
    @current_menu_link = :show
  end
end
