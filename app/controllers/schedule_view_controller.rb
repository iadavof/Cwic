class ScheduleViewController < ApplicationController
  before_action :set_data, only: [:horizontal_day, :horizontal_week, :vertical_day]

  respond_to :html, except: [:entities, :reservations]
  respond_to :json, only: [:entities, :reservations]

  def horizontal_day
    render :schedule_view
  end

  def horizontal_week
    render :schedule_view
  end

  def vertical_day
    render :schedule_view
  end

  def entities
    # IMPROVEMENT: rename this method to entity_types?
    @entity_types = @organisation.entity_types.with_entities.includes(:entities)
    respond_with(@entity_types)
  end

  def reservations
    # PERFORMANCE: rewrite this so we fetch the reservations instead of entities (and then for each entity the reservations)
    # IMPROVEMENT: refactor this method
    @entities = @organisation.entities.find(params[:entity_ids])

    if params[:schedule_begin].present? && params[:schedule_end].present?
      @begin_date = params[:schedule_begin].to_date
      @end_date = params[:schedule_end].to_date
    else
      @begin_date = Date.today
      @end_date = (Date.today + 1.weeks)
    end

    respond_with(@entities)
  end

private
  def set_data
    @sel_entity = params[:entity].to_i if params[:entity].present?

    @year = params[:year].try(:to_i) # Used for the both the day and week calendars
    @month = params[:month].try(:to_i) # Used for the day calendars
    @day = params[:day].try(:to_i) # Used for the day calendars
    @week = params[:week].try(:to_i) # Used for the week calendars

    @reservation = @organisation.reservations.build # Build new reservation for add reservation modal
  end
end
