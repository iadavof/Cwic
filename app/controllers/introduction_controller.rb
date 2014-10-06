class IntroductionController < ApplicationController
  skip_before_action :authenticate_user!

  layout 'introduction'

  # GET /intro
  def index
    @newsletter_signup = NewsletterSignup.new
    @intro_sections = IntroSection.all
    respond_with(@intro_sections)
  end
end
