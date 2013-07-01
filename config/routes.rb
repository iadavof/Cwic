Cwic::Application.routes.draw do

  resources :reservations

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".
  get "home/index"
  root to: 'home#index'

  devise_for :users, controllers: { registrations: "users/registrations", invitations: 'users/invitations' }

  resources :organisations do
    resources :organisation_users, except: :show
    match '/organisation_users/send_invitation', controller: 'organisation_users', action: 'send_invitation', via: 'post'
    match '/organisation_users/:id/resend_invitation', controller: 'organisation_users', action: 'resend_invitation', via: 'post', as: 'organisation_user_resend_invitation'
    resources :entity_types
    resources :entities
    match '/reservations/index_domain', controller: 'reservations', action: 'index_domain', via: 'post', as: 'reservations_domain_json'
    resources :reservations

    resources :organisation_clients
  end
end
