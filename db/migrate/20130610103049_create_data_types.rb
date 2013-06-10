class CreateDataTypes < ActiveRecord::Migration
  def change
    create_table :data_types do |t|
      t.string :key
      t.string :rails_type
      t.string :form_type

      t.timestamps
    end
  end
end
