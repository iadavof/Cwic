module ReservationRuleScopesHelper
  def render_reservation_rule_scopes_for_owner(owner)
    render_reservation_rule_scopes(owner.reservation_rule_scopes.arrange(order: :id), owner)
  end

  def render_reservation_rule_scopes(scopes, owner)
    scopes.map do |scope, sub_scopes|
      render(scope, owner: owner) + content_tag(:div, render_reservation_rule_scopes(sub_scopes, owner), class: "nested-scopes")
    end.join.html_safe
  end
end
