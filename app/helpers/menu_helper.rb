module MenuHelper
  def menu
    menu = {
      overview: {
        home: {
          index: { name: t('.dashboard'), url: home_index_path, icon: 'icon-home' }
        },
      },
      reservations: {
        reservations: {
          index: { url: organisation_reservations_path(current_organisation), icon: 'icon-list' },
          new: { url: new_organisation_reservation_path(current_organisation), icon: 'icon-plus-sign' }
        },
        planning: {
          horizontal_calendar_day: { url: organisation_schedule_view_horizontal_calendar_day_path(current_organisation), icon: 'icon-alignleftedge' },
          horizontal_calendar_week: { url: organisation_schedule_view_horizontal_calendar_week_path(current_organisation), icon: 'icon-alignleftedge' },
          vertical_calendar_day: { url: organisation_schedule_view_vertical_calendar_day_path(current_organisation), icon: 'icon-aligntopedge' },
          today_and_tomorrow: { url: organisation_today_and_tomorrow_index_path(current_organisation), icon: 'icon-time' }
        },
        occupation_view: {
          day_occupation: { url: organisation_occupation_view_day_occupation_path(current_organisation), icon: 'icon-stocks' },
          week_occupation: { url: organisation_occupation_view_week_occupation_path(current_organisation), icon: 'icon-stocks' }
        },
      },
      organisation_clients: {
        organisation_clients: {
          index: { url: organisation_organisation_clients_path(current_organisation), icon: 'icon-list' },
          new: { url: new_organisation_organisation_client_path(current_organisation), icon: 'icon-plus-sign' }
        },
      },
      entities: {
        entities: {
          index: { url: organisation_entities_path(current_organisation), icon: 'icon-list' },
          new: { url: new_organisation_entity_path(current_organisation), icon: 'icon-plus-sign' }
        },
      },
      settings: {
        organisation_users: {
          index: { url: organisation_organisation_users_path(current_organisation), icon: 'icon-list' },
          new: { url: new_organisation_organisation_user_path(current_organisation), icon: 'icon-plus-sign' }
        },
        entity_types: {
          index: { url: organisation_entity_types_path(current_organisation), icon: 'icon-list' },
          new: { url: new_organisation_entity_type_path(current_organisation), icon: 'icon-plus-sign' },
          custom_icons: { url: organisation_entity_type_icons_path(current_organisation), icon: 'icon-picture' }
        },
        documents: {
          index: { url: organisation_documents_path(current_organisation), icon: 'icon-list' }
        },
        info_screens: {
          index: { url: organisation_info_screens_path(current_organisation), icon: 'icon-list' },
          new: { url: new_organisation_info_screen_path(current_organisation), icon: 'icon-plus-sign' }
        },
      },
    }
    if @admin
      menu[:admin] = {
        organisations: {
          index: { url: organisations_path, icon: 'icon-list' },
        },
        users: {
          index: { url: users_path, icon: 'icon-list' },
        },
        feedbacks: {
          index: { url: feedbacks_path, icon: 'icon-list' },
        },
        entity_type_icons: {
          index: { url: entity_type_icons_path, icon: 'icon-list' },
          new: { url: new_entity_type_icon_path, icon: 'icon-plus-sign' }
        },
        intro_sections: {
          index: { url: intro_sections_path, icon: 'icon-squaresettings' },
          new: { url: new_intro_section_path, icon: 'icon-plus-sign' }
        },
      }
    end
    menu
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
      update: :edit
    }
    current_menu_link == link_name || aliases[current_menu_link] == link_name
  end

  def link_matches?(category_name, sub_category_name, link_name)
    sub_category_matches?(category_name, sub_category_name) && link_name_matches?(link_name)
  end
end
