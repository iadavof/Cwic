class CrudController < ApplicationController
  before_action :load_parent
  before_action :load_collection
  before_action :load_member, except: :index

  before_action :assign_attributes, only: :update

  # authorize_resource TODO enable this line when authorization is implemented

  helper_method :member, :member_path, :parent_models, :parent, :parent_path, :collection, :collection_path, :listed_collection

  # Actions

  def index
    respond_with(collection)
  end

  def show
    respond_with(member)
  end

  def new
    respond_with(member)
  end

  def edit
    respond_with(member)
  end

  def create
    member.save
    respond_with(*member_path, location: redirect_location)
  end

  def update
    member.save
    respond_with(*member_path, location: redirect_location)
  end

  def destroy
    member.destroy
    respond_with(*member_path, alert: member.errors[:base], location: redirect_location)
  end

  protected

  # Name and model

  def model
    self.class.const_get self.class.name.match(/(?<collection>.*)Controller/)[:collection].singularize
  end

  # Member

  def member_name
    model.model_name.singular
  end

  def member_variable
    "@#{member_name}"
  end

  def member
    instance_variable_get(member_variable)
  end

  def load_member
    instance_variable_set(member_variable, (['new', 'create'].include?(action_name) ? build_member : find_member))
  end

  def find_member
    model.find(params[:id])
  end

  def build_member
    collection.build(member_params)
  end

  def assign_attributes
    member.assign_attributes(member_params)
  end

  def member_params_key
    member_name.to_sym
  end

  def member_params
    params.fetch(member_params_key, {}).permit(*permitted_params)
  end

  def permitted_params
    []
  end

  def member_path
    parent_path + [member]
  end

  def redirect_location
    nil # Use default respond_with behaviour
  end

  def interpolation_options
    { resource_name: member.instance_name }
  end

  # Parent

  def parent?
    parent_model.present?
  end

  def parent_models
    []
  end

  def parent_model
    if parent_models.present?
      parent_model = parent_models.reject(&:nil?).find { |pm| parent_id(pm) }
      if parent_models.include?(parent_model)
        parent_model # Found parent model allowed: return it (could be nil if having no parent is allowed)
      else
        parent_models.first # No allowed parent found: force first allowed parent
      end
    end
  end

  def parent_name(parent = nil)
    parent ||= parent_model
    parent.model_name.singular
  end

  def parent_id_key(parent = nil)
    "#{parent_name(parent)}_id" if parent || parent?
  end

  def parent_id(parent = nil)
    params[parent_id_key(parent)]
  end

  def parent_method
    parent_name
  end

  def parent_variable
    "@#{parent_name}" if parent?
  end

  def parent
    instance_variable_get(parent_variable) if parent?
  end

  def load_parent
    parent = find_parent
    instance_variable_set(parent_variable, parent) if parent
  end

  def find_parent
    return unless parent?

    if member.present?
      member.send(parent_method)
    else
      parent_model.find(parent_id)
    end
  end

  def parent_path
    (parent? ? [parent] : [])
  end

  # Collection

  def collection_name
    model.model_name.plural
  end

  def collection_method
    collection_name
  end

  def collection_variable
    "@#{collection_name}"
  end

  def collection_includes
    []
  end

  def collection
    instance_variable_get(collection_variable)
  end

  def load_collection
    instance_variable_set(collection_variable, find_collection)
  end

  def find_collection
    rel = (parent? ? parent.send(collection_method) : model)
    rel = rel.accessible_by(current_ability, :index)
    rel = rel.ssp(params) if rel.respond_to?(:ssp)
    rel = rel.includes(collection_includes) if collection_includes.present?
    rel
  end

  def listed_collection
    collection
  end

  def collection_path
    parent_path + [model]
  end
end
