class ScheduleViewController < ApplicationController
  def index
    @reservation = @organisation.reservations.build
    render :index
  end

  def horizontal_calendar

    render :horizontal_calendar
  end

  def today_and_tomorrow

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
                    text_color: text_color(r.entity.color),
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
                  icon: e.entity_type.entity_type_icon.image.icon.url,
                  name: e.instance_name,
                  color: e.color,
                  selected: false,
                }
    end
    render json: { entities: result }, status: :ok
  end

protected
  def color_luminosity_difference(color1, color2)
    color1 = hex_color_to_rgb(color1)
    color2 = hex_color_to_rgb(color2)
    l1 = 0.2126 * ((color1[0] / 225.0) ** 2.2) + 0.7152 * ((color1[1] / 225.0) ** 2.2) + 0.0722 * ((color1[2] / 225.0) ** 2.2)
    l2 = 0.2126 * ((color2[0] / 225.0) ** 2.2) + 0.7152 * ((color2[1] / 225.0) ** 2.2) + 0.0722 * ((color2[2] / 225.0) ** 2.2)
    if l1 > l2
      (l1 + 0.05) / (l2 + 0.05)
    else
      (l2 + 0.05) / (l1 + 0.05)
    end
  end

  def text_color(bg_color)
    max_d = 0
    max_color = nil
    colors = ['#000000', '#FFFFFF']
    colors.each do |color|
      d = color_luminosity_difference(bg_color, color)
      if d > max_d
        max_d = d
        max_color = color
      end
    end
    max_color
  end

  def hex_color_to_rgb(color)
    color = color[1..7] if color[0] == '#'
    color.scan(/../).map { |c| c.to_i(16) }
  end
end
