class Ability
  include CanCan::Ability

  def initialize(user)
    can :manage, :all
    cannot [:update, :destroy], OrganisationUser, user: user
  end
end
