class AddFrontendNameToEntity < ActiveRecord::Migration
  def change
    add_column :entities, :frontend_name, :string
  end
end
