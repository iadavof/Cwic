class TodayAndTomorrowController < ApplicationController
  before_action :load_resource

  respond_to :html, only: [:index]
  respond_to :json, only: [:update]

  def index
    respond_with(@entity_types)
  end

  def update
    respond_with(@entity_types)
  end

  def current_menu_sub_category
    :schedule_view
  end

private
  def load_resource
    case params[:action]
    when 'index'
      @entity_types = @organisation.entity_types.with_entities.includes(:entities, :icon)
    when 'update'
      @entity_types = @organisation.entity_types.with_entities.includes(:entities)
    end
  end
end
