Cwic::Application.routes.draw do

  resources :reservations

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".
  get "home/index"
  root to: 'home#index'

  devise_for :users, controllers: { registrations: "users/registrations", invitations: 'users/invitations' }

  devise_scope :user do
    match '/users/:user_id/invitation/resend', controller: 'users/invitations', action: 'resend_invitation', via: 'post', as: 'resend_invitation'
  end

  resources :organisations do
    resources :organisation_users, except: [:show, :new, :destroy]
    match '/organisation_users/new', controller: 'organisation_users', action: 'new', via: 'post'
    resources :entity_types
    resources :entities
    resources :reservations
    resources :organisation_clients
  end
end
