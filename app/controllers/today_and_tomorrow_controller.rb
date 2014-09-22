class TodayAndTomorrowController < ApplicationController
  respond_to :html, only: :index
  respond_to :json, only: :reservations

  def index
    @entity_types = @organisation.entity_types.with_entities.includes(:entities, :icon)
    respond_with(@entity_types)
  end

  def reservations
    @reservations = @organisation.reservations.by_date_domain(Time.now, Date.tomorrow.end_of_day).includes(:organisation_client)
    respond_with(@reservations)
  end

  def current_menu_sub_category
    :schedule_view
  end
end
