class DocumentsController < ApplicationController
  before_action :load_resource
  authorize_resource

  def index
    respond_with(@documents)
  end

  def destroy
    @document.destroy
    respond_with(@organisation, Document)
  end

  def show
    send_file(@document.document.path, :disposition => 'attachment', :url_based_filename => false)
  end

private
  def load_resource
    case params[:action]
    when 'index'
      @documents = @organisation.documents.accessible_by(current_ability, :index).ssp(params)
    else
      @document = @organisation.documents.find(params[:id])
    end
  end
end
