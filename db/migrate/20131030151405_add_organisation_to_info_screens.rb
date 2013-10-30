class AddOrganisationToInfoScreens < ActiveRecord::Migration
  def change
    add_reference :info_screens, :organisation, index: true
  end
end
