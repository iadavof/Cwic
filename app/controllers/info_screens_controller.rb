class InfoScreensController < CrudController
  respond_to :html, except: :reservations
  respond_to :json, only: :reservations

  layout 'info_screen', only: [:show]

  def reservations
    @reservations = []
    @active_ises = @info_screen.info_screen_entities.active.includes(:entity)
    @active_ises.each do |ise|
      @reservations += ise.entity.reservations.by_date_domain(Time.now, Time.now + 1.day).info_boards.includes(:entity)
    end
    @reservations.sort_by(&:begins_at)
    respond_with(@organisation, @info_screen, @active_ises, @reservations)
  end

  private

  def parent_model
    Organisation
  end

  def collection_includes
    { info_screen_entities: :entity }
  end

  def permitted_params
    [
      :name, :public, :show_reservation_number, :add_new_entity_types, :direction_char_visible, :clock_header,
      info_screen_entity_types_attributes: [:id, :entity_type_id, :add_new_entities, :active,
        info_screen_entities_attributes: [:id, :entity_id, :direction_char, :active],
      ],
    ]
  end

  def redirect_location
    collection_path
  end
end
