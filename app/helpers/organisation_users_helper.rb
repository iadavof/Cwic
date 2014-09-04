module OrganisationUsersHelper
  def status_actions_for_user(organisation_user)
    case organisation_user.user.status
    when :awaiting_invitation_acceptance
      reinvite_link = link_to(t('.reinvite'), organisation_organisation_user_reinvite_path(@organisation, organisation_user), method: 'post')
      "#{t('.awaiting_invitation_acceptance')} (#{reinvite_link})".html_safe
    else # Active
      t('.active')
    end
  end
end
