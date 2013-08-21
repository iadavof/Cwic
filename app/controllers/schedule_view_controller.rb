class ScheduleViewController < ApplicationController

  def horizontal_calendar
    # creating new reservation for the option to add one in this view
    @reservation = @organisation.reservations.build
    render :horizontal_calendar
  end

  def today_and_tomorrow
    @entity_types = @organisation.entity_types
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
        current_reservations = @organisation.reservations.where(entity_id: ent.id).where('ends_at BETWEEN :start AND :end OR begins_at BETWEEN :start AND :end', start: start_date, end: end_date)
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
                    description: r.entity.description,
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
                  selected: false,
                }
    end
    render json: { entities: result }, status: :ok
  end

end
