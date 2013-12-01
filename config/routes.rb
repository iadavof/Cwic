Cwic::Application.routes.draw do
  resources :reservation_statuses

  get "home/index"
  root to: 'home#index'

  devise_for :users, controllers: { registrations: "users/registrations", invitations: 'users/invitations' }

  resources :users, except: [:new]
  resources :entity_type_icons # admin page for managing the entity type icons
  resources :feedbacks, except: [:new, :edit]

  resources :organisations do
    resources :organisation_users, except: :show
    match '/organisation_users/send_invitation', controller: 'organisation_users', action: 'send_invitation', via: 'post'
    match '/organisation_users/:id/resend_invitation', controller: 'organisation_users', action: 'resend_invitation', via: 'post', as: 'organisation_user_resend_invitation'
    resources :entity_types

    resources :entities do
      resources :reservation_rule_scopes
    end

    resources :info_screens
    match 'info_screens/:id/reservations', controller: 'info_screens', action: 'info_screen_reservations', via: 'get', as: 'info_screen_reservations'

    resources :stickies, except: [:show, :create, :new]
    match 'stickies/:resource/:rid/', controller: 'stickies', action: 'weight_update', via: 'patch', as: 'edit_sticky_for_resource'
    match 'stickies/:resource/:rid/', controller: 'stickies', action: 'stickies_for', via: 'get', as: 'stickies_for_resource'
    match 'stickies/:resource/:rid/new', controller: 'stickies', action: 'create', via: 'post', as: 'new_sticky_for_resource'

    # Routes for rendering the schedules
    match '/schedule_view/horizontal_calendar_day', controller: 'schedule_view', action: 'horizontal_calendar_day', via: 'get'
    match '/schedule_view/horizontal_calendar_day/:year/:month/:day', controller: 'schedule_view', action: 'horizontal_calendar_day', via: 'get'
    match '/schedule_view/horizontal_calendar_day/:year/:month/:day/entity/:entity', controller: 'schedule_view', action: 'horizontal_calendar_day', via: 'get'
    match '/schedule_view/horizontal_calendar_week', controller: 'schedule_view', action: 'horizontal_calendar_week', via: 'get'
    match '/schedule_view/horizontal_calendar_week/:year/:week', controller: 'schedule_view', action: 'horizontal_calendar_week', via: 'get'
    match '/schedule_view/horizontal_calendar_week/:year/:week/entity/:entity', controller: 'schedule_view', action: 'horizontal_calendar_week', via: 'get'
    match '/schedule_view/today_and_tomorrow', controller: 'schedule_view', action: 'today_and_tomorrow', via: 'get'

    # JSON routes for schedules
    match '/schedule_view/index_domain', controller: 'schedule_view', action: 'index_domain', via: 'post', as: 'reservations_domain_json'
    match '/schedule_view/entities', controller: 'schedule_view', action: 'entities', via: 'get', as: 'schedule_entities_json'
    match '/schedule_view/today_tomorrow_update', controller: 'schedule_view', action: 'today_tomorrow_update', via: 'get', as: 'today_tomorrow_update_json'
    match '/schedule_view', controller: 'schedule_view', action: 'index', via: 'get', as: 'schedule_view_index'

    # Routes for dayOccupation
    match '/occupation_view', controller: 'occupation_view', action: 'index', via: 'get', as: 'occupation_view'
    match '/occupation_view/entities', controller: 'occupation_view', action: 'entities', via: 'post', as: 'occupation_view_entities_json'
    match '/occupation_view/day_occupation_percentages', controller: 'occupation_view', action: 'day_occupation_percentages', via: 'post', as: 'occupation_view_day_occupation_percentages'
    match '/occupation_view/week_occupation_percentages', controller: 'occupation_view', action: 'week_occupation_percentages', via: 'post', as: 'occupation_view_week_occupation_percentages'
    match '/day_occupation', controller: 'occupation_view', action: 'day_occupation', via: 'get'
    match '/week_occupation', controller: 'occupation_view', action: 'week_occupation', via: 'get'

    match 'reservations/:id/update_status', controller: 'reservations', action: 'update_status', via: 'patch', as: 'reservations_update_status'
    resources :reservations
    match '/organisation_clients/autocomplete_search', controller: 'organisation_clients', action: 'autocomplete_search', via: 'get'
    resources :organisation_clients
    resources :entity_type_icons

    match '/search/results', controller: 'search', action: 'results', via: 'get'
  end
end
