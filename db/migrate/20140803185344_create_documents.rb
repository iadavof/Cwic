class CreateDocuments < ActiveRecord::Migration
  def change
    create_table :documents do |t|
      t.references :documentable, index: true
      t.string :documentable_type, :string
      t.references :organisation, index: true
      t.references :user, index: true
      t.string :document

      t.timestamps
    end
  end
end
