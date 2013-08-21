class CreateEntityPropertiesValues < ActiveRecord::Migration
  def change
    create_table :entity_properties_values do |t|
      t.belongs_to :entity_property, index: true
      t.belongs_to :value, index: true
    end
  end
end
