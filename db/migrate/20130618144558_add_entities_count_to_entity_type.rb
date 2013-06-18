class AddEntitiesCountToEntityType < ActiveRecord::Migration
  def up
    add_column :entity_types, :entities_count, :integer, null: false, default: 0
    EntityType.all.each do |entity_type|
      EntityType.reset_counters(entity_type.id, :entities)
    end
  end

  def down
    remove_column :entity_types, :entities_count
  end
end
