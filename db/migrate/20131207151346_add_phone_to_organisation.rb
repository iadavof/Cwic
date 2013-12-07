class AddPhoneToOrganisation < ActiveRecord::Migration
  def change
    add_column :organisations, :phone_general, :string
    add_column :organisations, :phone_reservations, :string
  end
end
