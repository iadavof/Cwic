require 'spec_helper'

describe "entity_type_icons/edit" do
  before(:each) do
    @entity_type_icon = assign(:entity_type_icon, stub_model(EntityTypeIcon,
      name: "MyString",
      organisation: nil
    ))
  end

  it "renders the edit entity_type_icon form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", entity_type_icon_path(@entity_type_icon), "post" do
      assert_select "input#entity_type_icon_name[name=?]", "entity_type_icon[name]"
      assert_select "input#entity_type_icon_organisation[name=?]", "entity_type_icon[organisation]"
    end
  end
end
