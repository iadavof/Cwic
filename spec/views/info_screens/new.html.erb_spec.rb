require 'spec_helper'

describe "info_screens/new" do
  before(:each) do
    assign(:info_screen, stub_model(InfoScreen,
      name: "MyString",
      public: false
    ).as_new_record)
  end

  it "renders new info_screen form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", info_screens_path, "post" do
      assert_select "input#info_screen_name[name=?]", "info_screen[name]"
      assert_select "input#info_screen_public[name=?]", "info_screen[public]"
    end
  end
end
