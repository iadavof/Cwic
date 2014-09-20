class StickiesController < CrudController
  skip_before_action :load_member, only: :update_weights

  respond_to :json

  def update_weights
    @stickies.each do |st|
      st.update(weight: params[:weights][st.id.to_s])
    end
    respond_with(@stickies)
  end

private
  def parent_models
    [Entity, OrganisationClient, Reservation]
  end

  def permitted_params
    [:sticky_text]
  end
end
