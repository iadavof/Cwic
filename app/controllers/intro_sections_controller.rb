class IntroSectionsController < CrudController

  private

  def permitted_params
    [:title, :body, :image, :weight, :background_color]
  end
end
