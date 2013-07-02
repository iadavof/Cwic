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
    entity_ids.each do |eid|
      current_reservations = @organisation.reservations.where(entity_id: eid).where('ends_at BETWEEN :start AND :end OR begins_at BETWEEN :start AND :end', start: start_date, end: end_date)
      items = []
      current_reservations.each do |r|
       items << {item_id: r.id, begin_date: r.begins_at.strftime('%Y-%m-%d'), begin_time: r.begins_at.strftime('%H:%M'), end_date: r.ends_at.strftime('%Y-%m-%d'), end_time: r.ends_at.strftime('%H:%M'), color: r.entity.entity_type.color, description: 'Beschrijving TODO'}
      end
      result << {schedule_object_id: eid, items: items }
    end
    render json: {begin_date: start_date.strftime('%Y-%m-%d'), end_date: end_date.strftime('%Y-%m-%d'), schedule_objects: result}, status: :ok
  else
    render json: {error: 'no entity selected'}, status: :not_found
  end
end


end
