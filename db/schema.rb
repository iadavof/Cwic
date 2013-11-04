# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20131104141404) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "data_types", force: true do |t|
    t.string   "key"
    t.string   "rails_type"
    t.string   "form_type"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "day_occupations", force: true do |t|
    t.integer  "entity_id"
    t.date     "day"
    t.float    "occupation"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "day_occupations", ["entity_id"], name: "index_day_occupations_on_entity_id", using: :btree

  create_table "entities", force: true do |t|
    t.integer  "organisation_id"
    t.integer  "entity_type_id"
    t.string   "name"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "color",                      default: "#18c13d"
    t.boolean  "include_entity_type_images", default: true
  end

  add_index "entities", ["entity_type_id"], name: "index_entities_on_entity_type_id", using: :btree
  add_index "entities", ["organisation_id"], name: "index_entities_on_organisation_id", using: :btree

  create_table "entity_images", force: true do |t|
    t.string   "title"
    t.integer  "entity_imageable_id"
    t.string   "entity_imageable_type"
    t.integer  "organisation_id"
    t.string   "image"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "entity_images", ["entity_imageable_id"], name: "index_entity_images_on_entity_imageable_id", using: :btree
  add_index "entity_images", ["organisation_id"], name: "index_entity_images_on_organisation_id", using: :btree

  create_table "entity_properties", force: true do |t|
    t.integer  "entity_id"
    t.integer  "property_type_id"
    t.text     "value"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "entity_properties", ["entity_id"], name: "index_entity_properties_on_entity_id", using: :btree
  add_index "entity_properties", ["property_type_id"], name: "index_entity_properties_on_property_type_id", using: :btree

  create_table "entity_properties_values", force: true do |t|
    t.integer "entity_property_id"
    t.integer "value_id"
  end

  add_index "entity_properties_values", ["entity_property_id"], name: "index_entity_properties_values_on_entity_property_id", using: :btree
  add_index "entity_properties_values", ["value_id"], name: "index_entity_properties_values_on_value_id", using: :btree

  create_table "entity_type_icons", force: true do |t|
    t.string   "name"
    t.integer  "organisation_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "image"
  end

  add_index "entity_type_icons", ["organisation_id"], name: "index_entity_type_icons_on_organisation_id", using: :btree

  create_table "entity_type_options", force: true do |t|
    t.integer  "entity_type_id"
    t.string   "name"
    t.text     "description"
    t.decimal  "default_price",   precision: 16, scale: 2, default: 0.0
    t.integer  "index"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "amount_relevant",                          default: false
  end

  add_index "entity_type_options", ["entity_type_id"], name: "index_entity_type_options_on_entity_type_id", using: :btree

  create_table "entity_type_properties", force: true do |t|
    t.integer  "entity_type_id"
    t.string   "name"
    t.text     "description"
    t.integer  "data_type_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "default_value"
    t.boolean  "required",       default: false
    t.integer  "index",          default: 0
  end

  add_index "entity_type_properties", ["data_type_id"], name: "index_entity_type_properties_on_data_type_id", using: :btree
  add_index "entity_type_properties", ["entity_type_id"], name: "index_entity_type_properties_on_entity_type_id", using: :btree

  create_table "entity_type_property_options", force: true do |t|
    t.integer  "entity_type_property_id"
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "default"
    t.integer  "index",                   default: 0
  end

  add_index "entity_type_property_options", ["entity_type_property_id"], name: "index_entity_type_property_options_on_entity_type_property_id", using: :btree

  create_table "entity_types", force: true do |t|
    t.string   "name"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "organisation_id"
    t.integer  "entities_count",  default: 0, null: false
    t.integer  "icon_id"
  end

  add_index "entity_types", ["icon_id"], name: "index_entity_types_on_icon_id", using: :btree
  add_index "entity_types", ["organisation_id"], name: "index_entity_types_on_organisation_id", using: :btree

  create_table "feedbacks", force: true do |t|
    t.text     "message"
    t.text     "specs"
    t.string   "screen_capture"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "user_id"
    t.integer  "organisation_id"
  end

  add_index "feedbacks", ["organisation_id"], name: "index_feedbacks_on_organisation_id", using: :btree
  add_index "feedbacks", ["user_id"], name: "index_feedbacks_on_user_id", using: :btree

  create_table "info_screen_entities", force: true do |t|
    t.string   "direction_char"
    t.integer  "info_screen_entity_type_id"
    t.integer  "entity_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "active"
  end

  add_index "info_screen_entities", ["entity_id"], name: "index_info_screen_entities_on_entity_id", using: :btree
  add_index "info_screen_entities", ["info_screen_entity_type_id"], name: "index_info_screen_entities_on_info_screen_entity_type_id", using: :btree

  create_table "info_screen_entity_types", force: true do |t|
    t.boolean  "add_new_entities"
    t.integer  "info_screen_id"
    t.integer  "entity_type_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "active"
  end

  add_index "info_screen_entity_types", ["entity_type_id"], name: "index_info_screen_entity_types_on_entity_type_id", using: :btree
  add_index "info_screen_entity_types", ["info_screen_id"], name: "index_info_screen_entity_types_on_info_screen_id", using: :btree

  create_table "info_screens", force: true do |t|
    t.string   "name"
    t.boolean  "public"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "add_new_entity_types"
    t.integer  "organisation_id"
    t.boolean  "direction_char_visible", default: true
    t.boolean  "clock_header",           default: true
  end

  add_index "info_screens", ["organisation_id"], name: "index_info_screens_on_organisation_id", using: :btree

  create_table "organisation_clients", force: true do |t|
    t.string   "first_name"
    t.string   "infix"
    t.string   "last_name"
    t.string   "email"
    t.integer  "organisation_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "route"
    t.string   "street_number"
    t.string   "postal_code"
    t.string   "locality"
    t.string   "country"
    t.string   "administrative_area_level_2"
    t.string   "administrative_area_level_1"
    t.string   "address_type"
    t.float    "lat"
    t.float    "lng"
  end

  add_index "organisation_clients", ["organisation_id"], name: "index_organisation_clients_on_organisation_id", using: :btree

  create_table "organisation_roles", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "organisation_users", force: true do |t|
    t.integer  "organisation_id"
    t.integer  "user_id"
    t.integer  "organisation_role_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "organisation_users", ["organisation_id"], name: "index_organisation_users_on_organisation_id", using: :btree
  add_index "organisation_users", ["organisation_role_id"], name: "index_organisation_users_on_organisation_role_id", using: :btree
  add_index "organisation_users", ["user_id"], name: "index_organisation_users_on_user_id", using: :btree

  create_table "organisations", force: true do |t|
    t.string   "name"
    t.string   "route"
    t.string   "street_number"
    t.string   "postal_code"
    t.string   "locality"
    t.string   "country"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "administrative_area_level_2"
    t.string   "administrative_area_level_1"
    t.string   "address_type"
    t.float    "lat"
    t.float    "lng"
  end

  create_table "pg_search_documents", force: true do |t|
    t.text     "content"
    t.integer  "searchable_id"
    t.string   "searchable_type"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "reservation_rule_scope_spans", force: true do |t|
    t.integer  "scope_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "year_from"
    t.integer  "month_from"
    t.integer  "dom_from"
    t.integer  "week_from"
    t.integer  "dow_from"
    t.integer  "hour_from"
    t.integer  "minute_from"
    t.integer  "year_to"
    t.integer  "month_to"
    t.integer  "dom_to"
    t.integer  "week_to"
    t.integer  "dow_to"
    t.integer  "hour_to"
    t.integer  "minute_to"
  end

  add_index "reservation_rule_scope_spans", ["scope_id"], name: "index_reservation_rule_scope_spans_on_scope_id", using: :btree

  create_table "reservation_rule_scopes", force: true do |t|
    t.integer  "entity_id"
    t.string   "name"
    t.integer  "repetition_unit_id"
    t.string   "ancestry"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "span_selector"
  end

  add_index "reservation_rule_scopes", ["entity_id"], name: "index_reservation_rule_scopes_on_entity_id", using: :btree
  add_index "reservation_rule_scopes", ["repetition_unit_id"], name: "index_reservation_rule_scopes_on_repetition_unit_id", using: :btree

  create_table "reservation_rules", force: true do |t|
    t.integer  "entity_id"
    t.integer  "period_unit_id"
    t.integer  "period_amount",                           default: 1
    t.integer  "min_periods",                             default: 1
    t.integer  "max_periods"
    t.decimal  "price",          precision: 16, scale: 2, default: 0.0
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "reservation_rules", ["entity_id"], name: "index_reservation_rules_on_entity_id", using: :btree
  add_index "reservation_rules", ["period_unit_id"], name: "index_reservation_rules_on_period_unit_id", using: :btree

  create_table "reservations", force: true do |t|
    t.datetime "begins_at"
    t.datetime "ends_at"
    t.integer  "entity_id"
    t.integer  "organisation_id"
    t.integer  "organisation_client_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "reservations", ["entity_id"], name: "index_reservations_on_entity_id", using: :btree
  add_index "reservations", ["organisation_client_id"], name: "index_reservations_on_organisation_client_id", using: :btree
  add_index "reservations", ["organisation_id"], name: "index_reservations_on_organisation_id", using: :btree

  create_table "stickies", force: true do |t|
    t.integer  "stickable_id"
    t.integer  "user_id"
    t.text     "sticky_text"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "stickable_type"
    t.integer  "organisation_id"
    t.integer  "weight"
  end

  add_index "stickies", ["organisation_id"], name: "index_stickies_on_organisation_id", using: :btree
  add_index "stickies", ["stickable_id"], name: "index_stickies_on_stickable_id", using: :btree
  add_index "stickies", ["user_id"], name: "index_stickies_on_user_id", using: :btree

  create_table "time_units", force: true do |t|
    t.string   "key"
    t.boolean  "common",     default: true
    t.integer  "seconds"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", force: true do |t|
    t.string   "first_name"
    t.string   "last_name"
    t.string   "infix"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: ""
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
    t.string   "invitation_token"
    t.datetime "invitation_created_at"
    t.datetime "invitation_sent_at"
    t.datetime "invitation_accepted_at"
    t.integer  "invitation_limit"
    t.integer  "invited_by_id"
    t.string   "invited_by_type"
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["invitation_token"], name: "index_users_on_invitation_token", unique: true, using: :btree
  add_index "users", ["invited_by_id"], name: "index_users_on_invited_by_id", using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  create_table "week_occupations", force: true do |t|
    t.integer  "entity_id"
    t.integer  "week"
    t.integer  "year"
    t.float    "occupation"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "week_occupations", ["entity_id"], name: "index_week_occupations_on_entity_id", using: :btree

end