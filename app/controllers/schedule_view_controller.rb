class ScheduleViewController < ApplicationController

  def horizontal_calendar
    # creating new reservation for the option to add one in this view
    @reservation = @organisation.reservations.build
    render :horizontal_calendar
  end

  def today_and_tomorrow
    @entity_types = @organisation.entity_types.with_entities
    render :today_and_tomorrow
  end

  def index_domain
    if params[:entity_ids].present?
      entity_ids = params[:entity_ids].split(',')
      if params[:schedule_begin].present? && params[:schedule_end].present?
        start_date = DateTime.strptime(params[:schedule_begin], "%Y-%m-%d").change({hour: 0, minutes: 0, sec: 0})
        end_date = DateTime.strptime(params[:schedule_end], "%Y-%m-%d").change({hour: 23, minutes: 59, sec: 59})
      else
        start_date = Date.today
        end_date = (Date.today + 2.weeks)
      end
      result = []
      entities = @organisation.entities.where(id: entity_ids)
      entities.each do |ent|
        current_reservations = ent.reservations.where('ends_at BETWEEN :start AND :end OR begins_at BETWEEN :start AND :end', start: start_date, end: end_date)
        items = []
        current_reservations.each do |r|
          items << {
                    item_id: r.id,
                    begin_date: r.begins_at.strftime('%Y-%m-%d'),
                    begin_time: r.begins_at.strftime('%H:%M'),
                    end_date: r.ends_at.strftime('%Y-%m-%d'),
                    end_time: r.ends_at.strftime('%H:%M'),
                    bg_color: r.entity.color,
                    text_color: r.entity.text_color,
                    description: r.organisation_client.instance_name,
                  }
        end
        result << { schedule_object_id: ent.id, schedule_object_name: ent.instance_name, items: items }
      end
      render json: { begin_date: start_date.strftime('%Y-%m-%d'), end_date: end_date.strftime('%Y-%m-%d'), schedule_objects: result }, status: :ok
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
          begin_date: r.begins_at.strftime('%Y-%m-%d'),
          begin_time: r.begins_at.strftime('%H:%M'),
          end_date: r.ends_at.strftime('%Y-%m-%d'),
          end_time: r.ends_at.strftime('%H:%M'),
          description: r.organisation_client.instance_name,
          progress: calculate_current_progress(r),
        }
        if current[:begin_date] != current[:end_date]
          current[:day_separators] = reservation_day_change_at(r)
        end
        current
      end
  end

  def today_tomorrow_update_upcoming_reservation(entity)
      upcoming = {
        today: get_standard_reservation_info_for_scope(Time.now, Time.now.change({hour: 23, minutes: 59, sec: 59}), entity),
        tomorrow: get_standard_reservation_info_for_scope(Time.now.change({hour: 0, minutes: 0, sec: 0}) + 1.day, Time.now.change({hour: 23, minutes: 59, sec: 59}) + 1.day, entity),
      }
  end

  def get_standard_reservation_info_for_scope (scope_begin, scope_end, entity)
      res = []
      reservations = entity.reservations.where('begins_at >= :start AND begins_at < :end', start: scope_begin, end: scope_end)
      reservations.each do |r|
      res << {
                        item_id: r.id,
                        begin_date: r.begins_at.strftime('%Y-%m-%d'),
                        begin_time: r.begins_at.strftime('%H:%M'),
                        end_date: r.ends_at.strftime('%Y-%m-%d'),
                        end_time: r.ends_at.strftime('%H:%M'),
                        description: r.organisation_client.instance_name,
                      }
      end
      res
  end

  def calculate_current_progress(reservation)
    timePontToReservationProgress(reservation, Time.now)
  end

  def timePontToReservationProgress(reservation, point)
    seconds = reservation.ends_at.to_time.to_i - reservation.begins_at.to_time.to_i
    seconds_past = point.to_i - reservation.begins_at.to_time.to_i
    (seconds_past.to_f / seconds.to_f * 100.00).round(2)
  end

  def reservation_day_change_at(reservation)
    dateChangeAt = []
    point = reservation.begins_at.change({hour: 23, minutes: 59, sec: 59})
    dateChangeAt << point.to_time

    while(point + 1.day < reservation.ends_at)
      point = point + 1.day
      dateChangeAt << point.to_time
    end
    dateChangeAt.map {|p| timePontToReservationProgress(reservation, p) }

  end

end
