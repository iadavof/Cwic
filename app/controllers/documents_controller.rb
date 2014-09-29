class DocumentsController < CrudController
  def show
    send_file(@document.document.path, disposition: 'attachment', url_based_filename: false)
  end

  private

  def parent_model
    Organisation
  end
end
