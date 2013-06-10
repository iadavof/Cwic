require 'spec_helper'

describe "entity_types/edit" do
  before(:each) do
    @entity_type = assign(:entity_type, stub_model(EntityType,
      :name => "MyString",
      :description => "MyText"
    ))
  end

  it "renders the edit entity_type form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", entity_type_path(@entity_type), "post" do
      assert_select "input#entity_type_name[name=?]", "entity_type[name]"
      assert_select "textarea#entity_type_description[name=?]", "entity_type[description]"
    end
  end
end
