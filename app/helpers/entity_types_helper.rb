module EntityTypesHelper
  def destroy_confirm(entity_type)
    t('entity_types.still_used_destroy_confirm', name: entity_type.name, count: entity_type.entities.size) if entity_type.entities.size > 0
  end

  def entity_type_audit_format(attr_name, value)
    case attr_name
    when 'min_reservation_length', 'max_reservation_length'
      (value.nil? ?  I18n.t('none') : "#{value} #{I18n.t('minutes_abbr')}")
    when 'slack_before', 'slack_after'
      (value.nil? ?  I18n.t('default') : "#{value} #{I18n.t('minutes_abbr')}")
    else
      generic_format(value)
    end
  end
end
