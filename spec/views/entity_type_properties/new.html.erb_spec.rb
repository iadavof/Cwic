require 'spec_helper'

describe "entity_type_properties/new" do
  before(:each) do
    assign(:entity_type_property, stub_model(EntityTypeProperty,
      :entity_type => nil,
      :name => "MyString",
      :description => "MyText",
      :data_type => nil
    ).as_new_record)
  end

  it "renders new entity_type_property form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", entity_type_properties_path, "post" do
      assert_select "input#entity_type_property_entity_type[name=?]", "entity_type_property[entity_type]"
      assert_select "input#entity_type_property_name[name=?]", "entity_type_property[name]"
      assert_select "textarea#entity_type_property_description[name=?]", "entity_type_property[description]"
      assert_select "input#entity_type_property_data_type[name=?]", "entity_type_property[data_type]"
    end
  end
end
