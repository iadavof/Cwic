class CreateIntroSections < ActiveRecord::Migration
  def change
    create_table :intro_sections do |t|
      t.string :title
      t.text :body
      t.string :image
      t.integer :weight, default: 0
      t.string :background_color, default: '#fff'

      t.timestamps
    end
  end
end
