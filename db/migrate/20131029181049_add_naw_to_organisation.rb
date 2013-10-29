class AddNawToOrganisation < ActiveRecord::Migration
  def change
  	rename_column :organisations, :street, :route
  	rename_column :organisations, :house_number, :street_number
  	rename_column :organisations, :city, :locality
  	add_column :organisations, :administrative_area_level_2, :string, after: :country
  	add_column :organisations, :administrative_area_level_1, :string, after: :administrative_area_level_2
  	add_column :organisations, :address_type, :string, after: :administrative_area_level_1
  	add_column :organisations, :lat, :float, after: :address_type
  	add_column :organisations, :lng, :float, after: :lat
  end
end
