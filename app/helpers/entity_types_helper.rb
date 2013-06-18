module EntityTypesHelper
  def destroy_confirm(entity_type)
    t('entity_types.still_used_destroy_confirm', count: entity_type.entities.size) if entity_type.entities.size > 0
  end
end
