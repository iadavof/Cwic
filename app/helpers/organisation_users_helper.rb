module OrganisationUsersHelper
  def status_actions_for_user(organisation_user)
    case organisation_user.user.status
    when :awaiting_invitation_acceptance
      return (t('.awaiting_invitation_acceptance') + ' (' + link_to(t('.resend_invitation'), organisation_organisation_user_resend_invitation_path(@organisation, organisation_user), method: 'post') + ')').html_safe
    else #active
      return t('.active')
    end
  end
end
