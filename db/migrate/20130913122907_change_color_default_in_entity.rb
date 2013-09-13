class ChangeColorDefaultInEntity < ActiveRecord::Migration
  def change
    change_column :entities, :color, :string, default: '#18c13d'
  end
end
