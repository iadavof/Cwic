class ReservationRulesController < ApplicationController
  before_action :load_scopeable
  before_action :load_scope
  before_action :load_resource
  authorize_resource through: :scope

  # GET /reservation_rules
  def index
    respond_with(@organisation, @scopeable, @reservation_rule_scopes, @reservation_rules)
  end

  # GET /reservation_rules/1
  def show
    respond_with(@organisation, @scopeable, @reservation_rule_scopes, @reservation_rules)
  end

  # GET /reservation_rules/new
  def new
    respond_with(@organisation, @scopeable, @reservation_rule_scopes, @reservation_rules)
  end

  # GET /reservation_rules/1/edit
  def edit
    respond_with(@reservation_rule)
  end

  # POST /reservation_rules
  def create
    @reservation_rule.localized.attributes = resource_params
    @reservation_rule.save
    respond_with(@organisation, @scopeable, @reservation_rule_scopes, @reservation_rules, location: [@organisation, @scopeable])
  end

  # PATCH/PUT /reservation_rules/1
  def update
    @reservation_rule.localized.update_attributes(resource_params)
    respond_with(@organisation, @scopeable, @reservation_rule_scopes, @reservation_rules, location: [@organisation, @scopeable])
  end

  # DELETE /reservation_rules/1
  def destroy
    @reservation_rule.destroy
    respond_with(@organisation, @scopeable, @reservation_rule_scopes, @reservation_rules, location: [@organisation, @scopeable])
  end

private
  def load_scopeable
    type = params[:scopeable_type] # Set by the routes so this should be safe
    @scopeable = @organisation.send(type.to_s.pluralize).find(params["#{type}_id"])
  end

  def load_scope
    @scope = @scopeable.reservation_rule_scopes.find(params[:reservation_rule_scope_id])
  end

  def load_resource
    case params[:action]
    when 'index'
      @reservation_rules = @scope.rules.accessible_by(current_ability, :index)
    when 'new', 'create'
      @reservation_rule = @scope.rules.build
    else
      @reservation_rule = @scope.rules.find(params[:id])
    end
  end

  def resource_params
    params.require(:reservation_rule).permit(:scope_id, :reserve_by, :period_unit_id, :period_amount, :min_periods, :max_periods, :price, :price_per, :price_period_unit_id, :price_period_amount)
  end

  def interpolation_options
    { resource_name: @reservation_rule.instance_name }
  end
end
