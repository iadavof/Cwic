class StickiesController < CrudController
  skip_before_action :load_member, only: :sort

  respond_to :json

  def sort
    @stickies.each do |s|
      s.set_list_position(params[:note].index(s.id.to_s) + 1)
    end
    render nothing: true
  end

  private

  def parent_models
    [Entity, OrganisationClient, Reservation]
  end

  def permitted_params
    [:sticky_text]
  end
end
