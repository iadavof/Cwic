json.begin_date @begin_date.to_date
json.end_date @end_date.to_date

json.schedule_entities do
  @entities.each do |entity|
    json.set! entity.id do
      json.default_slack_before entity.get_slack_before
      json.default_slack_after entity.get_slack_after
      json.items do
        entity.reservations.by_date_domain(@begin_date, @end_date, include_edges: true).includes(:reservation_status, :organisation_client, :entity).each do |reservation|
          json.set! reservation.id do
            json.partial! 'reservations/schedule_view', reservation: reservation
          end
        end
      end
    end
  end
end
