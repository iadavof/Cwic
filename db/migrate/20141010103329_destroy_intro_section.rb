class DestroyIntroSection < ActiveRecord::Migration
  def change
    drop_table :intro_sections
  end
end
