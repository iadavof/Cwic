require 'spec_helper'

describe "property_types/edit" do
  before(:each) do
    @property_type = assign(:property_type, stub_model(PropertyType,
      :entity_type => nil,
      :name => "MyString",
      :description => "MyText",
      :data_type => nil
    ))
  end

  it "renders the edit property_type form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", property_type_path(@property_type), "post" do
      assert_select "input#property_type_entity_type[name=?]", "property_type[entity_type]"
      assert_select "input#property_type_name[name=?]", "property_type[name]"
      assert_select "textarea#property_type_description[name=?]", "property_type[description]"
      assert_select "input#property_type_data_type[name=?]", "property_type[data_type]"
    end
  end
end
