class AddFilenameAndFilesizeToDocument < ActiveRecord::Migration
  def change
    add_column :documents, :document_filename, :string, index: true
    add_column :documents, :document_size, :integer
  end
end
