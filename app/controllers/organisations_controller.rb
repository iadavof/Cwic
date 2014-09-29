class OrganisationsController < CrudController
  respond_to :html, except: :tag_search
  respond_to :json, only: :tag_search

  def tag_search
    @tags = @organisation.owned_tags_with_part(params[:tag_part])
    respond_with(@tags)
  end

  private

  def permitted_params
   [:name, :phone_general, :phone_reservations, :route, :street_number, :locality, :administrative_area_level_2, :administrative_area_level_1, :country, :postal_code, :address_type, :lng, :lat]
  end
end
