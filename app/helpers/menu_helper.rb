module MenuHelper
  def menu
    return @menu if @menu.present?
    @menu = {
      overview: {
        home: {
          links: {
            index: { name: t('.dashboard'), url: home_index_path, icon: 'icon-home' },
          },
        },
      },
      reservations: {
        reservations: {
          links: {
            index: { url: organisation_reservations_path(current_organisation), icon: 'icon-list' },
            new: { url: new_organisation_reservation_path(current_organisation), icon: 'icon-plus-sign' },
          },
        },
        schedule_view: {
          links: {
            horizontal_day: { url: organisation_schedule_view_horizontal_day_path(current_organisation), icon: 'icon-alignleftedge' },
            horizontal_week: { url: organisation_schedule_view_horizontal_week_path(current_organisation), icon: 'icon-alignleftedge' },
            vertical_day: { url: organisation_schedule_view_vertical_day_path(current_organisation), icon: 'icon-aligntopedge' },
            today_and_tomorrow: { url: organisation_today_and_tomorrow_index_path(current_organisation), icon: 'icon-time' },
          },
        },
        occupation_view: {
          links: {
            day: { url: organisation_occupation_view_day_path(current_organisation), icon: 'icon-stocks' },
            week: { url: organisation_occupation_view_week_path(current_organisation), icon: 'icon-stocks' },
          },
        },
      },
      organisation_clients: {
        organisation_clients: {
          links: {
            index: { url: organisation_organisation_clients_path(current_organisation), icon: 'icon-list' },
            new: { url: new_organisation_organisation_client_path(current_organisation), icon: 'icon-plus-sign' },
          },
        },
      },
      entities: construct_entities_menu,
      settings: {
        my_organisations: {
          links: {
            show: { url: my_organisation_path(current_organisation), icon: 'icon-eye-view' },
          },
        },
        organisation_users: {
          links: {
            index: { url: organisation_organisation_users_path(current_organisation), icon: 'icon-list' },
            new: { url: new_organisation_organisation_user_path(current_organisation), icon: 'icon-plus-sign' },
          },
        },
        entity_types: {
          links: {
            index: { url: organisation_entity_types_path(current_organisation), icon: 'icon-list' },
            new: { url: new_organisation_entity_type_path(current_organisation), icon: 'icon-plus-sign' },
            custom_icons: { url: organisation_entity_type_icons_path(current_organisation), icon: 'icon-picture' },
          },
        },
        entities: {
          links: {
            index: { url: organisation_entities_path(current_organisation), icon: 'icon-list' },
            new: { url: new_organisation_entity_path(current_organisation), icon: 'icon-plus-sign' },
          },
        },
        organisation_documents: {
          links: {
            index: { url: organisation_documents_path(current_organisation), icon: 'icon-list' },
          },
        },
        info_screens: {
          links: {
            index: { url: organisation_info_screens_path(current_organisation), icon: 'icon-list' },
            new: { url: new_organisation_info_screen_path(current_organisation), icon: 'icon-plus-sign' },
          },
        },
      },
    }
    if @admin
      @menu[:admin] = {
        organisations: {
          links: {
            index: { url: organisations_path, icon: 'icon-list' },
          },
        },
        users: {
          links: {
            index: { url: users_path, icon: 'icon-list' },
          },
        },
        feedbacks: {
          links: {
            index: { url: feedbacks_path, icon: 'icon-list' },
          },
        },
        entity_type_icons: {
          links: {
            index: { url: entity_type_icons_path, icon: 'icon-list' },
            new: { url: new_entity_type_icon_path, icon: 'icon-plus-sign' },
          },
        },
        newsletter_signups: {
          links: {
            index: { url: newsletter_signups_path, icon: 'icon-list' },
            new: { url: new_newsletter_signup_path, icon: 'icon-plus-sign' },
          },
        },
      }
    end
    @menu
  end

  def construct_entities_menu
    submenu = {}
    current_organisation.entity_types.includes(:entities).each do |et|
      submenu[et.id] = { name: et.instance_name, links: {} }
      et.entities.each do |e|
        submenu[et.id][:links][e.id] = { name: e.instance_name, color: e.color, url: organisation_entity_path(current_organisation, e) }
      end
    end
    submenu
  end

  def category_name_matches?(category_name)
    current_menu_category == category_name || menu[category_name][current_menu_sub_category].present?
  end
  alias_method :category_matches?, :category_name_matches?

  def sub_category_name_matches?(sub_category_name)
    current_menu_sub_category == sub_category_name
  end

  def sub_category_matches?(category_name, sub_category_name)
    category_matches?(category_name) && sub_category_name_matches?(sub_category_name)
  end

  def link_name_matches?(link_name)
    aliases = {
      create: :new,
      update: :edit,
    }
    current_menu_link == link_name || aliases[current_menu_link] == link_name
  end

  def link_matches?(category_name, sub_category_name, link_name)
    sub_category_matches?(category_name, sub_category_name) && link_name_matches?(link_name)
  end
end
