module EntitiesHelper
  def entity_audit_format(attr_name, value)
    case attr_name
    when 'entity_type_id'
      name_link_to_show([@organisation, EntityType.find(value)])
    when 'slack_before', 'slack_after'
      (value.nil? ?  t('default') : "#{value} #{t('minutes_abbr').lcfirst}")
    else
      generic_format(value)
    end
  end
end
