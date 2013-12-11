json.begin_date @begin_date.to_date
json.end_date @end_date.to_date

json.schedule_objects do
  @entities.each do |entity|
    json.set! entity.id do
      json.schedule_object_name entity.full_instance_name
      json.items do
        entity.get_schedule_reservations(@begin_date, @end_date, true).each do |reservation|
          json.set! reservation.id do
            json.partial! 'reservations/schedule_view', reservation: reservation
          end
        end
      end
    end
  end
end