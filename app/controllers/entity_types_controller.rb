class EntityTypesController < CrudController
  private

  def parent_model
    Organisation
  end

  def permitted_params
    [
      :tag_list, :name, :description, :icon_id, :slack_before, :slack_after, :min_reservation_length, :max_reservation_length,
      properties_attributes: [
        :id, :name, :description, :data_type_id, :required, :default_value, :index, :_destroy,
        options_attributes: [:id, :name, :default, :index, :_destroy]
      ],
      images_attributes: [:id, :title, :image, :image_cache, :remote_image_url, :_destroy],
      reservation_statuses_attributes: [:id, :name, :color, :index, :default_status, :blocking, :info_boards, :billable, :_destroy],
      reservation_periods_attributes: [:id, :name, :period_amount, :period_unit_id, :min_periods, :max_periods, :price, :_destroy],
    ]
  end
end
