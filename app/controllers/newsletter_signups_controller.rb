class NewsletterSignupsController < CrudController
  skip_before_action :authenticate_user!, only: :public_signup
  skip_before_action :load_member, only: :public_signup

  def public_signup
    # TODO improve this when crud controller is improved with split of build_member and load member callbacks
    @newsletter_signup = build_member
    if @newsletter_signup.save
      NotificationMailer.newsletter_signup_notification(@newsletter_signup).deliver
      redirect_to root_path, notice: I18n.t('newsletter_signups.thanks')
    else
      redirect_to root_path, alert: @newsletter_signup.errors.full_messages.first
    end
  end

  private

  def permitted_params
    [:email]
  end

  def respond_location
    collection_path
  end
end
