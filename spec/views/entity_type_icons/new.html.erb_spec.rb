require 'spec_helper'

describe "entity_type_icons/new" do
  before(:each) do
    assign(:entity_type_icon, stub_model(EntityTypeIcon,
      :name => "MyString",
      :organisation => nil
    ).as_new_record)
  end

  it "renders new entity_type_icon form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", entity_type_icons_path, "post" do
      assert_select "input#entity_type_icon_name[name=?]", "entity_type_icon[name]"
      assert_select "input#entity_type_icon_organisation[name=?]", "entity_type_icon[organisation]"
    end
  end
end
