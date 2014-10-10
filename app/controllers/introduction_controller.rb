class IntroductionController < ApplicationController
  skip_before_action :authenticate_user!

  layout 'introduction'

  # GET /intro
  def index
    @newsletter_signup = NewsletterSignup.new
    respond_with(@newsletter_signup)
  end
end
