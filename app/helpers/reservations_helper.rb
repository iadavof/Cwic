module ReservationsHelper
  def filter_summary(of, date_domain_from, date_domain_to)
    if of.present? && date_domain_from.present? && date_domain_to.present?
      t('.reservations_of_from_to', of: of.instance_name, from: date_domain_from, to: date_domain_to)
    elsif of.present? && date_domain_from.present?
      t('.reservations_of_from', of: of.instance_name, from: date_domain_from)
    elsif of.present? && date_domain_to.present?
      t('.reservations_of_to', of: of.instance_name, to: date_domain_to)
    elsif date_domain_from.present? && date_domain_to.present?
      t('.reservations_from_to', from: date_domain_from, to: date_domain_to)
    elsif date_domain_from.present?
      t('.reservations_from', from: date_domain_from)
    elsif date_domain_to.present?
      t('.reservations_to', to: date_domain_to)
    elsif of.present?
      t('.reservations_of', of: of.instance_name)
    else
      ''
    end
  end

  def slack_before_overlap_warning(reservation)
    if reservation.slack_before_overlapping?
      content_tag(:div, class: 'slack-warning') do
        content_tag(:i, '', class: 'icon-warning-sign') + t('.slack_before_overlaps_with_html', reservation: link_to(reservation.previous.instance_name, organisation_reservation_path(@organisation, reservation.previous)))
      end
    end
  end

  def slack_after_overlap_warning(reservation)
    if reservation.slack_after_overlapping?
      content_tag(:div, class: 'slack-warning') do
        content_tag(:i, '', class: 'icon-warning-sign') + t('.slack_after_overlaps_with_html', reservation: link_to(reservation.next.instance_name, organisation_reservation_path(@organisation, reservation.next)))
      end
    end
  end

  def reservation_audit_format(attr_name, value)
    case attr_name
    when 'entity_id'
      name_link_to_show([@organisation, Entity.find(value)]) rescue I18n.t('deleted')
    when 'organisation_client_id'
      name_link_to_show([@organisation, OrganisationClient.find(value)]) rescue I18n.t('deleted')
    when 'reservation_status_id'
      ReservationStatus.find(value).instance_name rescue I18n.t('deleted')
    when 'slack_before', 'slack_after'
      (value.nil? ?  I18n.t('default') : "#{value} #{I18n.t('minutes_abbr').lcfirst}")
    else
      generic_format(value)
    end
  end
end
