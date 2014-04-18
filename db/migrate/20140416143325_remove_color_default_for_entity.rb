class RemoveColorDefaultForEntity < ActiveRecord::Migration
  def up
    change_column_default :entities, :color, nil
  end

  def down
    change_column_default :entities, :color, '#18c13d'
  end
end
