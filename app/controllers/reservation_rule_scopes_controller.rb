class ReservationRuleScopesController < ApplicationController
  before_action :load_entity
  before_action :load_resource
  authorize_resource through: :organisation

  # GET /reservation_rule_scopes
  def index
    respond_with(@organisation, @entity, @reservation_rule_scopes)
  end

  # GET /reservation_rule_scopes/1
  def show
    respond_with(@organisation, @entity, @reservation_rule_scope)
  end

  # GET /reservation_rule_scopes/new
  def new
    @reservation_rule_scope.spans.build
    respond_with(@organisation, @entity, @reservation_rule_scope)
  end

  # GET /reservation_rule_scopes/1/edit
  def edit
    respond_with(@organisation, @entity, @reservation_rule_scope)
  end

  # POST /reservation_rule_scopes
  def create
    @reservation_rule_scope.attributes = resource_params
    @reservation_rule_scope.save
    respond_with(@organisation, @entity, @reservation_rule_scope, location: [@organisation, @entity])
  end

  # PATCH/PUT /reservation_rule_scopes/1
  def update
    @reservation_rule_scope.update_attributes(resource_params)
    respond_with(@organisation, @entity, @reservation_rule_scope, location: [@organisation, @entity])
  end

  # DELETE /reservation_rule_scopes/1
  def destroy
    @reservation_rule_scope.destroy
    respond_with(@organisation, @entity, @reservation_rule_scope, location: [@organisation, @entity])
  end

private
  def load_entity
    @entity = @organisation.entities.find(params[:entity_id]) if params[:entity_id].present?
  end

  def load_resource
    case params[:action]
    when 'index'
      @reservation_rule_scopes = @entity.reservation_rule_scopes.accessible_by(current_ability, :index)
    when 'new', 'create'
      @reservation_rule_scope = @entity.reservation_rule_scopes.build(parent_id: params[:parent_id])
    else
      @reservation_rule_scope = @entity.reservation_rule_scopes.find(params[:id])
    end
  end

  def resource_params
    params.require(:reservation_rule_scope).permit(
      :entity_id, :parent_id, :name, :repetition_unit_id, :span_selector,
      spans_attributes: [
        :id,
        :year_from, :month_from, :dom_from, :nrom_from, :week_from, :dow_from, :holiday_from, :hour_from, :minute_from,
        :year_to, :month_to, :dom_to, :nrom_to, :week_to, :dow_to, :holiday_to, :hour_to, :minute_to,
        :_destroy
      ]
    )
  end

  def interpolation_options
    { resource_name: @reservation_rule_scope.instance_name }
  end
end
