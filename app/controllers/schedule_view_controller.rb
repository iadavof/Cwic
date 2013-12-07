class ScheduleViewController < ApplicationController

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

  def today_and_tomorrow
    @entity_types = @organisation.entity_types.with_entities
  end

  def index_domain
    if params[:entity_ids].present?
      entity_ids = params[:entity_ids].split(',')
      if params[:schedule_begin].present? && params[:schedule_end].present?
        @begin_date = Date.strptime(params[:schedule_begin], "%Y-%m-%d").beginning_of_day
        @end_date = Date.strptime(params[:schedule_end], "%Y-%m-%d").end_of_day
      else
        @begin_date = Date.today.beginning_of_day
        @end_date = (Date.today + 1.weeks).end_of_day
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

  def today_tomorrow_update
    result = []
    entity_types = @organisation.entity_types.with_entities
    entity_types.each do |et|
      entity_type_result = {
        entity_type_id: et.id,
        entities: [],
      }

      et.entities.each do |e|
        entity_type_result[:entities] << today_tomorrow_update_entity(e)
      end

      result << entity_type_result
    end
    render json: result, status: :ok
  end

  def today_tomorrow_update_entity(entity)
    {
      entity_id: entity.id,
      current_reservation: today_tomorrow_update_current_reservation(entity),
      upcoming_reservations: today_tomorrow_update_upcoming_reservation(entity),
    }
  end

  def today_tomorrow_update_current_reservation(entity)
    r = entity.reservations.where('begins_at < :update_moment AND ends_at >= :update_moment', update_moment: Time.now).first
    current = nil
    if r.present?
      current = {
        item_id: r.id,
        begin_moment: r.begins_at.strftime('%Y-%m-%d %H:%M'),
        end_moment: r.ends_at.strftime('%Y-%m-%d %H:%M'),
        description: r.instance_name + (r.description.present? ? (' : ' + r.description) : '') + ', ' + r.organisation_client.instance_name,
        progress: calculate_current_progress(r),
      }
      if r.begins_at.to_date != r.ends_at.to_date
        current[:day_separators] = reservation_day_change_at(r)
      end
      current
    end
  end

  def today_tomorrow_update_upcoming_reservation(entity)
    upcoming = {
      today: get_standard_reservation_info_for_scope(Time.now, Time.now.end_of_day, entity),
      tomorrow: get_standard_reservation_info_for_scope(Time.now.beginning_of_day + 1.day, Time.now.end_of_day + 1.day, entity),
    }
  end

  def get_standard_reservation_info_for_scope(scope_begin, scope_end, entity)
    res = []
    reservations = entity.reservations.where('begins_at >= :start AND begins_at < :end', start: scope_begin, end: scope_end)
    reservations.each do |r|
    res << {
      item_id: r.id,
      begin_moment: r.begins_at.strftime('%Y-%m-%d %H:%M'),
      end_moment: r.ends_at.strftime('%Y-%m-%d %H:%M'),
      description: r.instance_name + (r.description.present? ? (' : ' + r.description) : '') + ', ' + r.organisation_client.instance_name,
    }
    end
    res
  end

  def calculate_current_progress(reservation)
    time_point_to_reservation_progress(reservation, Time.now)
  end

  def time_point_to_reservation_progress(reservation, point)
    seconds = reservation.ends_at.to_time.to_i - reservation.begins_at.to_time.to_i
    seconds_past = point.to_i - reservation.begins_at.to_time.to_i
    (seconds_past.to_f / seconds.to_f * 100.00).round(2)
  end

  def reservation_day_change_at(reservation)
    dateChangeAt = []
    point = reservation.begins_at.end_of_day
    dateChangeAt << point.to_time

    while(point + 1.day < reservation.ends_at)
      point = point + 1.day
      dateChangeAt << point.to_time
    end
    dateChangeAt.map { |p| time_point_to_reservation_progress(reservation, p) }
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
end
