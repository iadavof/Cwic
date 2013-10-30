require 'spec_helper'

describe "info_screens/edit" do
  before(:each) do
    @info_screen = assign(:info_screen, stub_model(InfoScreen,
      :name => "MyString",
      :public => false
    ))
  end

  it "renders the edit info_screen form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", info_screen_path(@info_screen), "post" do
      assert_select "input#info_screen_name[name=?]", "info_screen[name]"
      assert_select "input#info_screen_public[name=?]", "info_screen[public]"
    end
  end
end
