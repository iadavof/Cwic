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

ActiveRecord::Schema.define(version: 20140906104928) do

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
    t.integer  "entity_id",  limit: 8
    t.date     "day"
    t.float    "percentage"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "day_occupations", ["entity_id"], name: "index_day_occupations_on_entity_id", using: :btree

  create_table "documents", force: true do |t|
    t.integer  "documentable_id",   limit: 8
    t.string   "documentable_type"
    t.string   "string"
    t.integer  "organisation_id",   limit: 8
    t.integer  "user_id",           limit: 8
    t.string   "document"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "document_filename"
    t.integer  "document_size"
  end

  add_index "documents", ["documentable_id"], name: "index_documents_on_documentable_id", using: :btree
  add_index "documents", ["organisation_id"], name: "index_documents_on_organisation_id", using: :btree
  add_index "documents", ["user_id"], name: "index_documents_on_user_id", using: :btree

  create_table "entities", force: true do |t|
    t.integer  "organisation_id",            limit: 8
    t.integer  "entity_type_id",             limit: 8
    t.string   "name"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "color"
    t.boolean  "include_entity_type_images",           default: true
    t.string   "frontend_name"
    t.integer  "slack_before"
    t.integer  "slack_after"
  end

  add_index "entities", ["entity_type_id"], name: "index_entities_on_entity_type_id", using: :btree
  add_index "entities", ["organisation_id"], name: "index_entities_on_organisation_id", using: :btree

  create_table "entity_images", force: true do |t|
    t.string   "title"
    t.integer  "imageable_id",    limit: 8
    t.string   "imageable_type"
    t.integer  "organisation_id", limit: 8
    t.string   "image"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "entity_images", ["imageable_id"], name: "index_entity_images_on_imageable_id", using: :btree
  add_index "entity_images", ["organisation_id"], name: "index_entity_images_on_organisation_id", using: :btree

  create_table "entity_properties", force: true do |t|
    t.integer  "entity_id",        limit: 8
    t.integer  "property_type_id", limit: 8
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
    t.integer  "organisation_id", limit: 8
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "image"
  end

  add_index "entity_type_icons", ["organisation_id"], name: "index_entity_type_icons_on_organisation_id", using: :btree

  create_table "entity_type_options", force: true do |t|
    t.integer  "entity_type_id",  limit: 8
    t.string   "name"
    t.text     "description"
    t.decimal  "default_price",             precision: 16, scale: 2, default: 0.0
    t.integer  "index"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "amount_relevant",                                    default: false
  end

  add_index "entity_type_options", ["entity_type_id"], name: "index_entity_type_options_on_entity_type_id", using: :btree

  create_table "entity_type_properties", force: true do |t|
    t.integer  "entity_type_id", limit: 8
    t.string   "name"
    t.text     "description"
    t.integer  "data_type_id",   limit: 8
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "default_value"
    t.boolean  "required",                 default: false
    t.integer  "index",                    default: 0
  end

  add_index "entity_type_properties", ["data_type_id"], name: "index_entity_type_properties_on_data_type_id", using: :btree
  add_index "entity_type_properties", ["entity_type_id"], name: "index_entity_type_properties_on_entity_type_id", using: :btree

  create_table "entity_type_property_options", force: true do |t|
    t.integer  "entity_type_property_id", limit: 8
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "default"
    t.integer  "index",                             default: 0
  end

  add_index "entity_type_property_options", ["entity_type_property_id"], name: "index_entity_type_property_options_on_entity_type_property_id", using: :btree

  create_table "entity_types", force: true do |t|
    t.string   "name"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "organisation_id",        limit: 8
    t.integer  "entities_count",                   default: 0, null: false
    t.integer  "icon_id",                limit: 8
    t.integer  "slack_before",                     default: 0
    t.integer  "slack_after",                      default: 0
    t.integer  "min_reservation_length"
    t.integer  "max_reservation_length"
  end

  add_index "entity_types", ["icon_id"], name: "index_entity_types_on_icon_id", using: :btree
  add_index "entity_types", ["organisation_id"], name: "index_entity_types_on_organisation_id", using: :btree

  create_table "feedbacks", force: true do |t|
    t.text     "message"
    t.text     "specs"
    t.string   "screen_capture"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "user_id",         limit: 8
    t.integer  "organisation_id", limit: 8
  end

  add_index "feedbacks", ["organisation_id"], name: "index_feedbacks_on_organisation_id", using: :btree
  add_index "feedbacks", ["user_id"], name: "index_feedbacks_on_user_id", using: :btree

  create_table "info_screen_entities", force: true do |t|
    t.string   "direction_char"
    t.integer  "info_screen_entity_type_id", limit: 8
    t.integer  "entity_id",                  limit: 8
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "active"
  end

  add_index "info_screen_entities", ["entity_id"], name: "index_info_screen_entities_on_entity_id", using: :btree
  add_index "info_screen_entities", ["info_screen_entity_type_id"], name: "index_info_screen_entities_on_info_screen_entity_type_id", using: :btree

  create_table "info_screen_entity_types", force: true do |t|
    t.boolean  "add_new_entities"
    t.integer  "info_screen_id",   limit: 8
    t.integer  "entity_type_id",   limit: 8
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
    t.integer  "organisation_id",         limit: 8
    t.boolean  "direction_char_visible",            default: true
    t.boolean  "clock_header",                      default: true
    t.boolean  "show_reservation_number",           default: false
  end

  add_index "info_screens", ["organisation_id"], name: "index_info_screens_on_organisation_id", using: :btree

  create_table "intro_sections", force: true do |t|
    t.string   "title"
    t.text     "body"
    t.string   "image"
    t.integer  "weight",           default: 0
    t.string   "background_color", default: "#fff"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "organisation_client_contacts", force: true do |t|
    t.integer  "organisation_client_id",      limit: 8
    t.string   "first_name"
    t.string   "infix"
    t.string   "last_name"
    t.string   "position"
    t.string   "route"
    t.string   "street_number"
    t.string   "postal_code"
    t.string   "locality"
    t.string   "country"
    t.string   "administrative_area_level_2"
    t.string   "administrative_area_level_1"
    t.string   "email"
    t.string   "phone"
    t.string   "mobile_phone"
    t.text     "note"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "organisation_client_contacts", ["organisation_client_id"], name: "index_organisation_client_contacts_on_organisation_client_id", using: :btree

  create_table "organisation_clients", force: true do |t|
    t.string   "first_name"
    t.string   "infix"
    t.string   "last_name"
    t.string   "email"
    t.integer  "organisation_id",             limit: 8
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "route"
    t.string   "street_number"
    t.string   "postal_code"
    t.string   "locality"
    t.string   "country"
    t.string   "administrative_area_level_2"
    t.string   "administrative_area_level_1"
    t.string   "phone"
    t.string   "mobile_phone"
    t.boolean  "business_client",                       default: false
    t.string   "company_name"
    t.string   "tax_number"
    t.string   "iban"
    t.string   "iban_att"
  end

  add_index "organisation_clients", ["organisation_id"], name: "index_organisation_clients_on_organisation_id", using: :btree

  create_table "organisation_roles", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "organisation_users", force: true do |t|
    t.integer  "organisation_id",      limit: 8
    t.integer  "user_id",              limit: 8
    t.integer  "organisation_role_id", limit: 8
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
    t.string   "phone_general"
    t.string   "phone_reservations"
  end

  create_table "pg_search_documents", force: true do |t|
    t.text     "content"
    t.integer  "searchable_id"
    t.string   "searchable_type"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "reservation_logs", force: true do |t|
    t.integer  "user_id",        limit: 8
    t.integer  "reservation_id", limit: 8
    t.string   "old_user_name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "reservation_logs", ["reservation_id"], name: "index_reservation_logs_on_reservation_id", using: :btree
  add_index "reservation_logs", ["user_id"], name: "index_reservation_logs_on_user_id", using: :btree

  create_table "reservation_statuses", force: true do |t|
    t.string   "name"
    t.integer  "index"
    t.string   "color"
    t.integer  "entity_type_id", limit: 8
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "blocking",                 default: true
    t.boolean  "info_boards",              default: true
    t.boolean  "billable",                 default: true
  end

  add_index "reservation_statuses", ["entity_type_id"], name: "index_reservation_statuses_on_entity_type_id", using: :btree

  create_table "reservations", force: true do |t|
    t.datetime "begins_at"
    t.datetime "ends_at"
    t.integer  "entity_id",              limit: 8
    t.integer  "organisation_id",        limit: 8
    t.integer  "organisation_client_id", limit: 8
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "description"
    t.integer  "reservation_status_id",  limit: 8
    t.integer  "base_reservation_id",    limit: 8
    t.integer  "slack_before"
    t.integer  "slack_after"
    t.boolean  "warning",                          default: false
  end

  add_index "reservations", ["base_reservation_id"], name: "index_reservations_on_base_reservation_id", using: :btree
  add_index "reservations", ["entity_id"], name: "index_reservations_on_entity_id", using: :btree
  add_index "reservations", ["organisation_client_id"], name: "index_reservations_on_organisation_client_id", using: :btree
  add_index "reservations", ["organisation_id"], name: "index_reservations_on_organisation_id", using: :btree
  add_index "reservations", ["reservation_status_id"], name: "index_reservations_on_reservation_status_id", using: :btree

  create_table "reserve_periods", force: true do |t|
    t.integer  "entity_type_id", limit: 8
    t.string   "name"
    t.integer  "period_amount"
    t.integer  "period_unit_id", limit: 8
    t.decimal  "price"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "reserve_periods", ["entity_type_id"], name: "index_reserve_periods_on_entity_type_id", using: :btree
  add_index "reserve_periods", ["period_unit_id"], name: "index_reserve_periods_on_period_unit_id", using: :btree

  create_table "stickies", force: true do |t|
    t.integer  "stickable_id",    limit: 8
    t.integer  "user_id",         limit: 8
    t.text     "sticky_text"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "stickable_type"
    t.integer  "organisation_id", limit: 8
    t.integer  "weight"
  end

  add_index "stickies", ["organisation_id"], name: "index_stickies_on_organisation_id", using: :btree
  add_index "stickies", ["stickable_id"], name: "index_stickies_on_stickable_id", using: :btree
  add_index "stickies", ["user_id"], name: "index_stickies_on_user_id", using: :btree

  create_table "time_units", force: true do |t|
    t.string   "key"
    t.boolean  "common",         default: true
    t.integer  "seconds"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "repetition_key"
  end

  create_table "users", force: true do |t|
    t.string   "first_name"
    t.string   "last_name"
    t.string   "infix"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "email",                            default: "", null: false
    t.string   "encrypted_password",               default: ""
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                    default: 0
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
    t.integer  "invited_by_id",          limit: 8
    t.string   "invited_by_type"
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["invitation_token"], name: "index_users_on_invitation_token", unique: true, using: :btree
  add_index "users", ["invited_by_id"], name: "index_users_on_invited_by_id", using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  create_table "week_occupations", force: true do |t|
    t.integer  "entity_id",  limit: 8
    t.integer  "week"
    t.integer  "year"
    t.float    "percentage"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "week_occupations", ["entity_id"], name: "index_week_occupations_on_entity_id", using: :btree

end
