class ScheduleViewController < ApplicationController
  before_action :load_resource

  respond_to :html, except: [:index_domain, :entities]
  respond_to :json, only: [:index_domain, :entities]

  def horizontal_calendar_day
    get_selected_entity_from_url
    get_selected_day_from_url

    # creating new reservation for the option to add one in this view
    @reservation = @organisation.reservations.build
    @title = I18n.t('schedule_view.horizontal_schedule_day');
    render 'schedule_view'
  end

  def horizontal_calendar_week
    get_selected_entity_from_url
    get_selected_week_from_url

    # creating new reservation for the option to add one in this view
    @reservation = @organisation.reservations.build
    @title = I18n.t('schedule_view.horizontal_schedule_week');
    render 'schedule_view'
  end

  def vertical_calendar_day
    get_selected_entity_from_url
    get_selected_day_from_url

    # creating new reservation for the option to add one in this view
    @reservation = @organisation.reservations.build
    @title = I18n.t('schedule_view.vertical_schedule_day');
    render 'schedule_view'
  end

  def index_domain
    if params[:entity_ids].present?
      entity_ids = params[:entity_ids].split(',')
      if params[:schedule_begin].present? && params[:schedule_end].present?
        @begin_date = params[:schedule_begin].to_date
        @end_date = params[:schedule_end].to_date
      else
        @begin_date = Date.today
        @end_date = (Date.today + 1.weeks)
      end
      @entities = @organisation.entities.where(id: entity_ids)
      respond_with(@entities)
    else
      render json: { error: 'no entity selected' }, status: :not_found
    end
  end

  def entities
    @entity_types = @organisation.entity_types.where('entities_count > 0')
    respond_with(@entity_types)
  end

  def get_selected_entity_from_url
    if params[:entity].present?
      @sel_entity = params[:entity].to_i
    end
  end

  def get_selected_day_from_url
    if params[:year].present? && params[:month].present? && params[:day].present?
      @year = params[:year].to_i
      @month = params[:month].to_i
      @day = params[:day].to_i
    end
  end

  def get_selected_week_from_url
    if params[:year].present? && params[:week].present?
      @year = params[:year].to_i
      @week = params[:week].to_i
    end
  end

  def current_menu_sub_category
    :planning
  end

private
  def load_resource
    case params[:action]
    when 'today_and_tomorrow'
      @entity_types = @organisation.entity_types.with_entities.includes(:entities, :icon)
    when 'today_tomorrow_update'
      @entity_types = @organisation.entity_types.with_entities.includes(:entities)
    end
  end
end
