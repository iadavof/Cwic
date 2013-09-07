class AddStickableStypeToStickies < ActiveRecord::Migration
  def change
  	add_column :stickies, :stickable_type, :string
  	add_reference :stickies, :organisation, index: true
  end
end
