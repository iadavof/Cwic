Cwic::Application.routes.draw do



  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".
  get "home/index"
  root to: 'home#index'

  devise_for :users, controllers: { registrations: "users/registrations", invitations: 'users/invitations' }
  # admin page for managing the entity type icons
  resources :entity_type_icons

  resources :organisations do
    resources :organisation_users, except: :show
    match '/organisation_users/send_invitation', controller: 'organisation_users', action: 'send_invitation', via: 'post'
    match '/organisation_users/:id/resend_invitation', controller: 'organisation_users', action: 'resend_invitation', via: 'post', as: 'organisation_user_resend_invitation'
    resources :entity_types
    resources :entities
    match '/schedule_view/index_domain', controller: 'schedule_view', action: 'index_domain', via: 'post', as: 'reservations_domain_json'
    match '/schedule_view/entities', controller: 'schedule_view', action: 'entities', via: 'post', as: 'entities_json'
    match '/schedule_view', controller: 'schedule_view', action: 'index', via: 'get', as: 'schedule_view_index'
    resources :reservations
    resources :organisation_clients
    resources :entity_type_icons
  end
end
