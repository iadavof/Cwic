Cwic::Application.routes.draw do
  get 'introduction/index'
  get 'home/index'
  root to: 'introduction#index'

  devise_for :users, controllers: { registrations: 'users/registrations', invitations: 'users/invitations' }

  get 'switch_organisation/:id/', controller: :application, action: :switch_organisation, as: :switch_organisation

  resources :organisations do
    post :tag_search, on: :member

    resources :organisation_users, except: :show do
      post :invite, on: :new
      post :reinvite, on: :member
    end

    resources :entity_types
    resources :entity_type_icons

    resources :entities do
      get :available, on: :collection
    end

    resources :reservations do
      post :multiple, on: :collection
      patch :update_status, on: :member
    end

    resources :organisation_clients do
      get :autocomplete, on: :collection
      get :vcard, on: :member
      resources :organisation_client_contacts, only: [:show, :index] do
        get :vcard, on: :member
      end
      resources :reservations
    end

    resources :info_screens do
      get :reservations, on: :member
    end

    resources :documents, except: [:new, :edit]

    # TODO rewrite this so stickies are routed through their parent
    resources :stickies, only: [:index, :update, :destroy] do
      get ':resource/:rid/', action: :stickies_for, on: :collection
      post ':resource/:rid/new', action: :create, on: :collection
      patch ':resource/:rid/', action: :weight_update, on: :collection
    end

    controller :schedule_view do
      # Horizontal day calendar
      get 'schedule_view/horizontal_day'
      get 'schedule_view/horizontal_day/entity/:entity/:year/:month/:day', action: :horizontal_day, as: :schedule_view_horizontal_day_entity_date
      get 'schedule_view/horizontal_day/:year/:month/:day', action: :horizontal_day, as: :schedule_view_horizontal_day_date

      # Horizontal week calendar
      get 'schedule_view/horizontal_week'
      get 'schedule_view/horizontal_week/entity/:entity/:year/:week', action: :horizontal_week, as: :schedule_view_horizontal_week_entity_date
      get 'schedule_view/horizontal_week/:year/:week', action: :horizontal_week, as: :schedule_view_horizontal_week_date

      # Vertical day calendar
      get 'schedule_view/vertical_day'
      get 'schedule_view/vertical_day/entity/:entity/:year/:month/:day', action: :vertical_day, as: :schedule_view_vertical_day_entity_date
      get 'schedule_view/vertical_day/:year/:month/:day', action: :vertical_day, as: :schedule_view_vertical_day_date

      # AJAX routes
      get 'schedule_view/entities'
      get 'schedule_view/reservations'
    end

    controller :today_and_tomorrow do
      get 'today_and_tomorrow/index'
      get 'today_and_tomorrow/update'
    end

    controller :occupation_view do
      get 'occupation_view/day'
      get 'occupation_view/week'
    end

    controller :search do
      get 'search/global'
      get 'search/tag/:id', action: :tag, as: :search_tag
    end
  end

  # Admin pages
  resources :users, except: :new
  resources :intro_sections
  resources :entity_type_icons
  resources :feedbacks, except: [:new, :edit]
end
