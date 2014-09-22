class IntroductionController < ApplicationController
  skip_before_action :authenticate_user!

  layout 'introduction'

  # GET /intro
  def index
    @intro_sections = IntroSection.all
    respond_with(@intro_sections)
  end
end
