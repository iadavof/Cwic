json.array!(@reservation_rules) do |reservation_rule|
  json.extract! reservation_rule, :id, :scope_id, :reserve_by, :period_unit_id, :period_amount, :min_periods, :max_periods, :price, :price_per, :price_period_unit_id, :price_period_amount
  json.url reservation_rule_url(reservation_rule, format: :json)
end
