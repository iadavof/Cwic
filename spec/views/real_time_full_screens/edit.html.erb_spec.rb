require 'spec_helper'

describe "real_time_full_screens/edit" do
  before(:each) do
    @real_time_full_screen = assign(:real_time_full_screen, stub_model(RealTimeFullScreen,
      :name => "MyString",
      :public => false
    ))
  end

  it "renders the edit real_time_full_screen form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", real_time_full_screen_path(@real_time_full_screen), "post" do
      assert_select "input#real_time_full_screen_name[name=?]", "real_time_full_screen[name]"
      assert_select "input#real_time_full_screen_public[name=?]", "real_time_full_screen[public]"
    end
  end
end
