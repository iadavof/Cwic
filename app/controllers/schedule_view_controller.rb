class ScheduleViewController < ApplicationController
  before_action :load_resource
  before_action :set_data, only: [:horizontal_day, :horizontal_week, :vertical_day]

  respond_to :html, except: [:entities, :index_domain]
  respond_to :json, only: [:entities, :index_domain]

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
    respond_with(@entity_types)
  end

  def index_domain
    if @entities.present?
      if params[:schedule_begin].present? && params[:schedule_end].present?
        @begin_date = params[:schedule_begin].to_date
        @end_date = params[:schedule_end].to_date
      else
        @begin_date = Date.today
        @end_date = (Date.today + 1.weeks)
      end

      respond_with(@entities)
    else
      render json: { error: 'no entity selected' }, status: :not_found
    end
  end

  def current_menu_sub_category
    :planning
  end

private
  def load_resource
    case params[:action]
    when 'entities'
      @entity_types = @organisation.entity_types.with_entities.includes(:entities)
    when 'index_domain'
      @entities = @organisation.entities.where(id: params[:entity_ids])
    end
  end

  def set_data
    @sel_entity = params[:entity].to_i if params[:entity].present?

    @year = params[:year].try(:to_i) # Used for the both the day and week calendars
    @month = params[:month].try(:to_i) # Used for the day calendars
    @day = params[:day].try(:to_i) # Used for the day calendars
    @week = params[:week].try(:to_i) # Used for the week calendars

    # Build new reservation for add reservation modal
    @reservation = @organisation.reservations.build
  end
end
