class AddOrganisationIdToEntityTypes < ActiveRecord::Migration
  def change
    add_reference :entity_types, :organisation, index: true, first: true
  end
end
