class ScheduleViewController < ApplicationController

def index
  render :index
end

def index_domain
  if params[:entity_ids].present?
    entity_ids = params[:entity_ids].split(',')
    if params[:schedule_begin].present? && params[:schedule_end].present?
      start_date = Date.strptime(params[:schedule_begin], "%Y-%m-%d")
      end_date = Date.strptime(params[:schedule_end], "%Y-%m-%d")
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
                  bg_color: r.entity.entity_type.color,
                  text_color: bw_text_color(r.entity.entity_type.color) == :white ? '#FFFFFF' : '#222222',
                  description: r.entity.description,
                }
      end
      result << {schedule_object_id: ent.id, schedule_object_name: ent.instance_name, items: items }
    end
    render json: {begin_date: start_date.strftime('%Y-%m-%d'), end_date: end_date.strftime('%Y-%m-%d'), schedule_objects: result}, status: :ok
  else
    render json: {error: 'no entity selected'}, status: :not_found
  end
end

def entities
  result = []
  @organisation.entities.each do |e|
    result << {
                id: e.id,
                icon: ActionController::Base.helpers.asset_path('Chair.png'),
                name: e.instance_name,
                color: e.entity_type.color,
                selected: false,
              }
  end
  render json: {entities: result}, status: :ok
end

protected

def bw_text_color(hex_bg_color)
  rgb_bg_color = hex_bg_color[1..7].scan(/../).map { |color| color.to_i(16) }
  puts rgb_bg_color.inspect
  bg_brightness = rgb_bg_color.sum
  puts bg_brightness.inspect
  (bg_brightness < 383 ? :white : :black)
end

end
