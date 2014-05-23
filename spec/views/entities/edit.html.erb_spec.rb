require 'spec_helper'

describe "entities/edit" do
  before(:each) do
    @entity = assign(:entity, stub_model(Entity,
      name: "MyString",
      description: "MyText",
      entity_type: nil,
      organisation: nil
    ))
  end

  it "renders the edit entity form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", entity_path(@entity), "post" do
      assert_select "input#entity_name[name=?]", "entity[name]"
      assert_select "textarea#entity_description[name=?]", "entity[description]"
      assert_select "input#entity_entity_type[name=?]", "entity[entity_type]"
      assert_select "input#entity_organisation[name=?]", "entity[organisation]"
    end
  end
end
