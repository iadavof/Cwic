class FrontendsController < CrudController

  private

  def parent_model
    Organisation
  end

  def collection_includes
    { frontend_entities: :entity }
  end

  def permitted_params
    [
      :name, :add_new_entity_types,
      frontend_entity_types_attributes: [:id, :entity_type_id, :add_new_entities, :active,
        frontend_entities_attributes: [:id, :entity_id, :active],
      ],
    ]
  end

  def respond_location
    collection_path
  end
end
