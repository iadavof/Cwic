Cwic::Application.routes.draw do
  get "home/index"
  devise_for :users, controllers: { registrations: "users/registrations" }
  resources :users

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".
  root to: 'home#index'
end
