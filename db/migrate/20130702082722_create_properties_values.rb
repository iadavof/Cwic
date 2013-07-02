class CreatePropertiesValues < ActiveRecord::Migration
  def change
    create_table :properties_values do |t|
      t.belongs_to :property, index: true
      t.belongs_to :value, index: true
    end
  end
end
