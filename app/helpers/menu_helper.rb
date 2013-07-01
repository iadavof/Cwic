module MenuHelper
  def menu
    {
      overview: {
        home: {
          index: { name: t('.home'), url: home_index_path }
        },
      },
      reservations: {
        reservations: {
          index: { url: organisation_reservations_path(current_organisation) }
        },
        organisation_clients: {
          index: { url: organisation_organisation_clients_path(current_organisation) }
        }
      },
      settings: {
        organisation_users: {
          index: { url: organisation_organisation_users_path(current_organisation) },
          new: { url: new_organisation_organisation_user_path(current_organisation) }
        },
        entity_types: {
          index: { url: organisation_entity_types_path(current_organisation) },
          new: { url: new_organisation_entity_type_path(current_organisation) }
        },
        entities: {
          index: { url: organisation_entities_path(current_organisation) },
          new: { url: new_organisation_entity_path(current_organisation) }
        }
      }
    }
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
      :create => :new,
      :update => :edit
    }
    current_menu_link == link_name || aliases[current_menu_link] == link_name
  end

  def link_matches?(category_name, sub_category_name, link_name)
    sub_category_matches?(category_name, sub_category_name) && link_name_matches?(link_name)
  end
end
