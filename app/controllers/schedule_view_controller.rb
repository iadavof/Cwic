class ScheduleViewController < ApplicationController
  def horizontal_calendar_day
    if params[:entity].present?
      @sel_entity = params[:entity].to_i
    end

    if params[:year].present? && params[:month].present? && params[:day].present?
      @year = params[:year].to_i
      @month = params[:month].to_i
      @day = params[:day].to_i
    end
    # creating new reservation for the option to add one in this view
    @reservation = @organisation.reservations.build
  end

  def horizontal_calendar_week
    if params[:year].present? && params[:week].present?
      @year = params[:year].to_i
      @week = params[:week].to_i
    end
    # creating new reservation for the option to add one in this view
    @reservation = @organisation.reservations.build
  end

  def today_and_tomorrow
    @entity_types = @organisation.entity_types.with_entities
  end

  def index_domain
    if params[:entity_ids].present?
      entity_ids = params[:entity_ids].split(',')
      if params[:schedule_begin].present? && params[:schedule_end].present?
        begin_date = Date.strptime(params[:schedule_begin], "%Y-%m-%d").beginning_of_day
        end_date = Date.strptime(params[:schedule_end], "%Y-%m-%d").end_of_day
      else
        begin_date = Date.today.beginning_of_day
        end_date = (Date.today + 1.weeks).end_of_day
      end
      result = {}
      entities = @organisation.entities.where(id: entity_ids)
      entities.each do |ent|
        # Get all the reservations (items) in the scope of begin_date to end_date.
        # However, we want to get the reservations directly before and after the scope as well to check for collisions in the schedule view. If there are no reservations found, then simply use the given date.
        begins_at = ent.reservations.where('ends_at < :begin', begin: begin_date).order(:ends_at).first.try(:begins_at) || begin_date
        ends_at = ent.reservations.where('begins_at > :end', end: end_date).order(:begins_at).first.try(:ends_at) || end_date
        # Use inclusive comparison to include the two reservations above as well
        current_reservations = ent.reservations.where('begins_at <= :end AND ends_at >= :begin', begin: begins_at, end: ends_at)
        items = {}
        current_reservations.each do |r|
          items[r.id] = {
            begin_moment: r.begins_at.strftime('%Y-%m-%d %H:%M'),
            end_moment: r.ends_at.strftime('%Y-%m-%d %H:%M'),
            bg_color: r.entity.color,
            text_color: r.entity.text_color,
            description: r.instance_name + (r.description.present? ? (' : ' + r.description) : '') + ', ' + r.organisation_client.instance_name,
            client_id: r.organisation_client.id,
          }
        end
        result[ent.id]  = { schedule_object_name: ent.instance_name, items: items }
      end
      render json: { begin_date: begin_date.to_date, end_date: end_date.to_date, schedule_objects: result }, status: :ok
    else
      render json: { error: 'no entity selected' }, status: :not_found
    end
  end

  def entities
    result = []
    @organisation.entities.each do |e|
      result << {
        id: e.id,
        icon: e.entity_type.icon.image.icon.url,
        name: e.instance_name,
        color: e.color,
      }
    end
    render json: { entities: result }, status: :ok
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
end
