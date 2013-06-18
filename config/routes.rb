Cwic::Application.routes.draw do
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".
  get "home/index"
  root to: 'home#index'

  devise_for :users, controllers: { registrations: "users/registrations" }

  resources :organisations do
    resources :users
    resources :entity_types
    resources :entities
  end
end
