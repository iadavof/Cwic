class AddAmountRelevantToEntityTypeOption < ActiveRecord::Migration
  def change
    add_column :entity_type_options, :amount_relevant, :bool, default: false, after: :description
  end
end
