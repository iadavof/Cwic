class OrganisationClientsController < CrudController
  skip_before_action :load_member, only: :autocomplete

  respond_to :html, except: :autocomplete
  respond_to :json, only: :autocomplete

  def autocomplete
    # PERFORMANCE: Kaminari performs two queries: one for total number of results and one to get results in scope.
    # This means the search is performed twice, making it unnecessary slow.
    # PostgreSQL has a feature to return the number of results without performing an extra query.
    # Maybe we could look into this some day. Or maybe we could remove pagination again (and just use a limit), to speed up things a little.
    @organisation_clients = parent.organisation_clients.autocomplete_search(params[:q]).page(params[:page]).accessible_by(current_ability, :index)
    respond_with(@organisation_clients)
  end

  # GET /organisation_clients/1/vcard
  def vcard
    send_data(@organisation_client.vcard.to_s, type: 'text/x-vcard', filename: @organisation_client.vcard_filename)
  end

  private

  def parent_model
    Organisation
  end

  def permitted_params
    [
      :tag_list, :business_client, :first_name, :infix, :last_name, :company_name, :email, :phone, :mobile_phone,
      :route, :street_number, :locality, :administrative_area_level_2, :administrative_area_level_1, :postal_code, :country,
      :tax_number, :iban, :iban_att,
      documents_attributes: [:id, :document, :document_cache, :remote_document_url, :_destroy],
      communication_records_attributes: [:id, :method, :emotion, :summary, :contact_id, :reservation_id, :_destroy],
      contacts_attributes: [
        :id, :first_name, :infix, :last_name, :position, :email, :phone, :mobile_phone,
        :route, :street_number, :locality, :administrative_area_level_2, :administrative_area_level_1, :postal_code, :country,
        :note, :_destroy
      ],
    ]
  end
end
