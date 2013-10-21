Cwic::Application.routes.draw do
  resources :real_time_full_screens

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".
  get "home/index"
  root to: 'home#index'

  devise_for :users, controllers: { registrations: "users/registrations", invitations: 'users/invitations' }
  # admin page for managing the entity type icons
  resources :users, except: [:new]
  resources :entity_type_icons
  resources :feedbacks, except: [:new, :edit]

  resources :organisations do
    resources :organisation_users, except: :show
    match '/organisation_users/send_invitation', controller: 'organisation_users', action: 'send_invitation', via: 'post'
    match '/organisation_users/:id/resend_invitation', controller: 'organisation_users', action: 'resend_invitation', via: 'post', as: 'organisation_user_resend_invitation'
    resources :entity_types

    resources :entities do
      resources :reservation_rule_scopes
    end

    resources :stickies, except: [:show, :create, :new]
    match 'stickies/:resource/:rid/', controller: 'stickies', action: 'weight_update', via: 'patch', as: 'edit_sticky_for_resource'
    match 'stickies/:resource/:rid/', controller: 'stickies', action: 'stickies_for', via: 'get', as: 'stickies_for_resource'
    match 'stickies/:resource/:rid/new', controller: 'stickies', action: 'create', via: 'post', as: 'new_sticky_for_resource'

    # Routes for rendering the schedules
    match '/schedule_view/horizontal_calendar', controller: 'schedule_view', action: 'horizontal_calendar', via: 'get'
    match '/schedule_view/today_and_tomorrow', controller: 'schedule_view', action: 'today_and_tomorrow', via: 'get'

    # JSON routes for schedules
    match '/schedule_view/index_domain', controller: 'schedule_view', action: 'index_domain', via: 'post', as: 'reservations_domain_json'
    match '/schedule_view/entities', controller: 'schedule_view', action: 'entities', via: 'post', as: 'schedule_entities_json'
    match '/schedule_view/today_tomorrow_update', controller: 'schedule_view', action: 'today_tomorrow_update', via: 'get', as: 'today_tomorrow_update_json'
    match '/schedule_view', controller: 'schedule_view', action: 'index', via: 'get', as: 'schedule_view_index'

    # Routes for dayOccupation
    match '/occupation_view', controller: 'occupation_view', action: 'index', via: 'get', as: 'occupation_view'
    match '/occupation_view/entities', controller: 'occupation_view', action: 'entities', via: 'post', as: 'occupation_view_entities_json'
    match '/occupation_view/day_occupation_percentages', controller: 'occupation_view', action: 'day_occupation_percentages', via: 'post', as: 'occupation_view_day_occupation_percentages'
    match '/occupation_view/week_occupation_percentages', controller: 'occupation_view', action: 'week_occupation_percentages', via: 'post', as: 'occupation_view_week_occupation_percentages'
    match '/day_occupation', controller: 'occupation_view', action: 'day_occupation', via: 'get'
    match '/week_occupation', controller: 'occupation_view', action: 'week_occupation', via: 'get'

    resources :reservations
    resources :organisation_clients
    resources :entity_type_icons
  end
end
