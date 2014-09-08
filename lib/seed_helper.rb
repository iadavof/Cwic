class ActiveRecord::Base
  def set(new_attributes)
    self.tap { |s| s.assign_attributes(new_attributes) }
  end
end

class SeedHelper
  class << self
    ##
    # Getters
    ##

    def admin_role
      role('Administrator')
    end

    def planner_role
      role('Planner')
    end

    def viewer_role
      role('Viewer')
    end

    def role(name)
      cache(:role, name) { OrganisationRole.find_by!(name: name) }
    end

    def data_type(key)
      cache(:data_type, key) { DataType.find_by!(key: key) }
    end

    def time_unit(key)
      cache(:time_unit, key) { TimeUnit.find_by!(key: key) }
    end

    def organisation(name)
      cache(:organisation, name) { Organisation.find_by!(name: name) }
    end

    def cache(type, key)
      @cache ||= {}
      @cache[type] ||= {}
      @cache[type][key] = yield
    end

    ##
    # Builders
    ##
    def create_organisation_clients(organisation, amount)
      amount.times do
        FactoryGirl.create(:organisation_client, organisation: organisation)
      end
    end

    def create_reservations(organisation, amount)
      raise "Organisation #{organisation.instance_name} does not have any entities" if organisation.entities.empty?
      raise "Organisation #{organisation.instance_name} does not have any organisation clients" if organisation.organisation_clients.empty?
      amount.times do
        entity = organisation.entities.sample
        organisation_client = organisation.organisation_clients.sample
        FactoryGirl.create(:reservation, organisation: organisation, entity: entity, organisation_client: organisation_client)
      end
    end

    def create_stickies(stickables, amount, options = {})
      amount_type = options.delete(:amount_type) || :avarage
      amount = amount_type == :avarage ? (amount * stickables.size).ceil : amount
      amount.times do
        stickable = stickables.sample
        organisation = stickable.organisation
        user = organisation.users.sample
        FactoryGirl.create(:sticky, organisation: organisation, stickable: stickable, user: user)
      end
    end

    def create_organisation_client_contacts(organisation_clients, amount, options = {})
      organisation_clients.each do |oc|
        amount.times do
          FactoryGirl.create(:organisation_client_contact, organisation_client: oc)
        end
      end
    end
  end
end
