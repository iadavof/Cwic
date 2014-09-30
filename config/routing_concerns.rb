concern :stickable do
  resources :stickies, only: [:index, :create, :update, :destroy] do
    patch :update_weights, on: :collection
  end
end
