class OrganisationDocumentsController < CrudController
  def show
    send_file(@document.document.path, disposition: 'attachment', url_based_filename: false)
  end

  private

  def model
    Document
  end

  def parent_model
    Organisation
  end
end
