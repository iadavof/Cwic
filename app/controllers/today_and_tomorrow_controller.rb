class TodayAndTomorrowController < ApplicationController
  before_action :load_resource

  def index
    respond_with(@entity_types)
  end

  def update
    result = []
    @entity_types.each do |et|
      entity_type_result = {
        entity_type_id: et.id,
        entities: [],
      }

      et.entities.each do |e|
        entity_type_result[:entities] << update_entity(e)
      end

      result << entity_type_result
    end
    render json: result, status: :ok
  end

  def current_menu_sub_category
    :planning
  end

  def current_menu_link
    :today_and_tomorrow
  end

private
  def load_resource
    case params[:action]
    when 'index'
      @entity_types = @organisation.entity_types.with_entities.includes(:entities, :icon)
    when 'update'
      @entity_types = @organisation.entity_types.with_entities.includes(:entities)
    end
  end

  def update_entity(entity)
    {
      entity_id: entity.id,
      current_reservation: update_current_reservation(entity),
      upcoming_reservations: update_upcoming_reservation(entity),
    }
  end

  def update_current_reservation(entity)
    r = entity.reservations.where('begins_at < :update_moment AND ends_at >= :update_moment', update_moment: Time.now).first
    current = nil
    if r.present?
      current = {
        item_id: r.id,
        begin_moment: r.begins_at.strftime('%Y-%m-%d %H:%M'),
        end_moment: r.ends_at.strftime('%Y-%m-%d %H:%M'),
        description: r.full_instance_name,
        progress: r.current_progress,
      }
      current[:day_separators] = reservation_day_change_at(r) unless r.begins_at.to_date == r.ends_at.to_date
      current
    end
  end

  def reservation_day_change_at(reservation)
    dateChangeAt = []
    point = reservation.begins_at.end_of_day
    dateChangeAt << point.to_time

    while(point + 1.day < reservation.ends_at)
      point = point + 1.day
      dateChangeAt << point.to_time
    end

    dateChangeAt.map { |p| reservation.progress_wrt_time_point(p) }
  end

  def update_upcoming_reservation(entity)
    {
      today: standard_reservation_info_for_scope(Time.now, Time.now.end_of_day, entity),
      tomorrow: standard_reservation_info_for_scope(Time.now.beginning_of_day + 1.day, Time.now.end_of_day + 1.day, entity),
    }
  end

  def standard_reservation_info_for_scope(scope_begin, scope_end, entity)
    res = []
    reservations = entity.reservations.where('begins_at >= :start AND begins_at < :end', start: scope_begin, end: scope_end)
    reservations.each do |r|
    res << {
      item_id: r.id,
      begin_moment: r.begins_at.strftime('%Y-%m-%d %H:%M'),
      end_moment: r.ends_at.strftime('%Y-%m-%d %H:%M'),
      description: r.full_instance_name,
    }
    end
    res
  end
end
