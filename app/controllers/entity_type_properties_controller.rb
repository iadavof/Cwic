class EntityTypePropertiesController < CrudController
  skip_before_action :load_member, only: :sort
  before_action :set_menu

  def sort
    @entity_type_properties.each do |etp|
      etp.set_list_position(params[:entity_type_property].index(etp.id.to_s) + 1)
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

  def collection_method
    :properties
  end

  def respond_location
    collection_path
  end

  def permitted_params
    [
      :name, :description, :data_type_id, :required, :default_value,
      options_attributes: [:id, :name, :default, :position, :_destroy]
    ]
  end

  def set_menu
    @current_menu_sub_category = :entity_types
    @current_menu_link = :show
  end
end
