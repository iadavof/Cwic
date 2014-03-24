class ReservationRuleScopesController < ApplicationController
  before_action :load_scopeable
  before_action :load_resource
  authorize_resource through: :organisation

  # GET /reservation_rule_scopes
  def index
    respond_with(@organisation, @scopeable, @reservation_rule_scopes)
  end

  # GET /reservation_rule_scopes/1
  def show
    respond_with(@organisation, @scopeable, @reservation_rule_scope)
  end

  # GET /reservation_rule_scopes/new
  def new
    respond_with(@organisation, @scopeable, @reservation_rule_scope)
  end

  # GET /reservation_rule_scopes/1/edit
  def edit
    respond_with(@organisation, @scopeable, @reservation_rule_scope)
  end

  # POST /reservation_rule_scopes
  def create
    @reservation_rule_scope.attributes = resource_params
    @reservation_rule_scope.save
    respond_with(@organisation, @scopeable, @reservation_rule_scope, location: [@organisation, @scopeable])
  end

  # PATCH/PUT /reservation_rule_scopes/1
  def update
    @reservation_rule_scope.update_attributes(resource_params)
    respond_with(@organisation, @scopeable, @reservation_rule_scope, location: [@organisation, @scopeable])
  end

  # DELETE /reservation_rule_scopes/1
  def destroy
    @reservation_rule_scope.destroy
    respond_with(@organisation, @scopeable, @reservation_rule_scope, location: [@organisation, @scopeable])
  end

private
  def load_scopeable
    type = params[:scopeable_type] # Set by the routes so this should be safe
    @scopeable = @organisation.send(type.to_s.pluralize).find(params["#{type}_id"])
  end

  def load_resource
    case params[:action]
    when 'index'
      @reservation_rule_scopes = @scopeable.reservation_rule_scopes.accessible_by(current_ability, :index)
    when 'new', 'create'
      @reservation_rule_scope = @scopeable.reservation_rule_scopes.build(parent_id: params[:parent_id])
    else
      @reservation_rule_scope = @scopeable.reservation_rule_scopes.find(params[:id])
    end
  end

  def resource_params
    params.require(:reservation_rule_scope).permit(:scopeable_id, :parent_id, :name, :repetition_unit_id, :span_type)
  end

  def interpolation_options
    { resource_name: @reservation_rule_scope.instance_name }
  end
end
