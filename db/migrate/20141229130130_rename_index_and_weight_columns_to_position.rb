class RenameIndexAndWeightColumnsToPosition < ActiveRecord::Migration
  def change
    # Rename all position related columns to position
    rename_column :reservation_statuses, :index, :position
    rename_column :entity_type_properties, :index, :position
    rename_column :entity_type_property_options, :index, :position
    rename_column :stickies, :weight, :position

    # Remove default value for all position columns
    change_column_default :reservation_statuses, :position, nil
    change_column_default :entity_type_properties, :position, nil
    change_column_default :entity_type_property_options, :position, nil
    change_column_default :stickies, :position, nil

    reversible do |dir|
      # Positions start counting at 1 instead of 0. Increase all positions by 1.
      operator = nil
      dir.up { operator = '+' }
      dir.down { operator = '-' }
      ReservationStatus.update_all("position = position #{operator} 1")
      EntityTypeProperty.update_all("position = position #{operator} 1")
      EntityTypePropertyOption.update_all("position = position #{operator} 1")
      Sticky.update_all("position = position #{operator} 1")
    end
  end
end
