class ApplicationResponder < ActionController::Responder
  include Responders::FlashResponder
  include Responders::HttpCacheResponder

  # Uncomment this responder if you want your resources to redirect to the collection
  # path (index action) instead of the resource path for POST/PUT/DELETE requests.
  # include Responders::CollectionResponder

  def to_json
    set_flash_message! if set_flash_message?
    if !has_errors? || response_overridden?
      default_render
    else
      controller.default_render( status: :unprocessable_entity )
    end
  end
end
