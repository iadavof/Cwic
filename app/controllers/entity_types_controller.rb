class EntityTypesController < CrudController
  def audits
    respond_with(@organisation, @entity_type)
  end

  private

  def parent_model
    Organisation
  end

  def permitted_params
    [
      :tag_list, :name, :description, :icon_id, :slack_before, :slack_after, :min_reservation_length, :max_reservation_length
    ]
  end
end
