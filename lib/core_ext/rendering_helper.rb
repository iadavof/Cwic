module ActionView::Helpers::RenderingHelper
  # Extend render method to fix support for rendering partial layouts with block content.
  # Normally the content of these layouts are rendered from the context of the layout, instead of the view the code is in.
  # This leads to several problems, such as making it more difficult to trace errors and leading to incorrect I18n key lookups (when using dot prefix).
  # The code below fixes these problems, but decrease performance and consume more memory.
  def render_with_fixed_layout_context(options = {}, locals = {}, &block)
    if options.is_a?(Hash) && options[:layout].present? && block_given?
      # We want to render a layout with block content.
      # Capture the block (so it is evaluated in the context of the current view) and then wrap the layout around it.
      content = capture(&block)
      render_without_fixed_layout_context(options) do
        content
      end
    else
      render_without_fixed_layout_context(options, locals, &block)
    end
  end
  alias_method_chain :render, :fixed_layout_context
end
