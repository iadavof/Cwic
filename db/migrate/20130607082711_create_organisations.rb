class CreateOrganisations < ActiveRecord::Migration
  def change
    create_table :organisations do |t|
      t.string :name
      t.string :street
      t.string :house_number
      t.string :postal_code
      t.string :city
      t.string :country

      t.timestamps
    end
  end
end
