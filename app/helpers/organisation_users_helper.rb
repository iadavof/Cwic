module OrganisationUsersHelper

def status_actions_for_user(user)
  case user.get_status
  when :awaiting_invitation_acceptance
    return (t('.awaiting_invitation_acceptance') + ' (' + link_to(t('.resend_invitation'), resend_invitation_path(user), method: 'post') + ')').html_safe
  else #active
    return t('.active')
  end
end

end
