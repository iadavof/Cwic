concern :stickable do
  resources :stickies, only: [:index, :create, :update, :destroy] do
    patch :sort, on: :collection
  end
end
