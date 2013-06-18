require 'spec_helper'

describe "entities/new" do
  before(:each) do
    assign(:entity, stub_model(Entity,
      :name => "MyString",
      :description => "MyText",
      :entity_type => nil,
      :organisation => nil
    ).as_new_record)
  end

  it "renders new entity form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", entities_path, "post" do
      assert_select "input#entity_name[name=?]", "entity[name]"
      assert_select "textarea#entity_description[name=?]", "entity[description]"
      assert_select "input#entity_entity_type[name=?]", "entity[entity_type]"
      assert_select "input#entity_organisation[name=?]", "entity[organisation]"
    end
  end
end
