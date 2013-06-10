require 'spec_helper'

describe "entity_types/new" do
  before(:each) do
    assign(:entity_type, stub_model(EntityType,
      :name => "MyString",
      :description => "MyText"
    ).as_new_record)
  end

  it "renders new entity_type form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", entity_types_path, "post" do
      assert_select "input#entity_type_name[name=?]", "entity_type[name]"
      assert_select "textarea#entity_type_description[name=?]", "entity_type[description]"
    end
  end
end
