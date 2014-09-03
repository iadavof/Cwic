class OrganisationClientContactsController < ApplicationController
  require 'vcard/vcard'

  before_action :load_organisation_client
  before_action :load_resource
  authorize_resource

  respond_to :json

  # GET /organisation_client_contacts
  def index
    respond_with(@organisation_client_contacts)
  end

  # GET /organisation_client_contacts/1
  def show
    respond_with(@organisation, @organisation_client, @organisation_client_contact)
  end

  # GET /organisation_client_contact/1/vcard
  def vcard
    send_data generate_vcard.to_s, type: 'text/x-vcard', filename: URI::encode(@organisation_client_contact.instance_name.gsub(/\s+/, "_").gsub(/[^0-9a-z_]/i, '')) + '.vcf'
  end

private
  def load_resource
    case params[:action]
    when 'index'
      @organisation_client_contacts = @organisation_client.contacts.accessible_by(current_ability, :index)
    else
      @organisation_client_contact = @organisation_client.contacts.find(params[:id])
    end
  end

  def resource_params
    params.require(:organisation_client_contact).permit(:first_name, :infix, :last_name, :position, :route, :street_number, :postal_code, :locality, :country, :administrative_area_level_2, :administrative_area_level_1, :email, :phone, :mobile_phone, :note)
  end

  def load_organisation_client
    if params[:organisation_client_id].present?
      @organisation_client = @organisation.organisation_clients.find(params[:organisation_client_id])
    end
  end

  def interpolation_options
    { resource_name: @organisation_client_contact.instance_name }
  end

  def generate_vcard
    Vcard::Vcard::Maker.make2 do |maker|

      #setting up name
      maker.add_name do |name|
        name.prefix = @organisation_client_contact.infix
        name.given = @organisation_client_contact.first_name
        name.family = @organisation_client_contact.last_name
      end

      # setting up address.
      maker.add_addr do |addr|
        addr.street = @organisation_client_contact.route + ' ' +  @organisation_client_contact.street_number
        addr.postalcode = @organisation_client_contact.postal_code
        addr.locality =  @organisation_client_contact.locality
        addr.region =  @organisation_client_contact.administrative_area_level_2 + ', ' + @organisation_client_contact.administrative_area_level_1
        addr.country =  @organisation_client_contact.country
      end

      maker.org = @organisation_client_contact.organisation_client.instance_name
      maker.title = (@organisation_client_contact.position)
      maker.add_tel(@organisation_client_contact.phone) { |e| e.location = 'work'}
      maker.add_tel(@organisation_client_contact.mobile_phone) { |e| e.location = 'cell'}

      maker.add_note(@organisation_client_contact.note)

      maker.add_email(@organisation_client_contact.email) { |e| e.location = 'work' }
    end
  end
end
