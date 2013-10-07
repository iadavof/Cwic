require 'spec_helper'

describe "real_time_full_screens/new" do
  before(:each) do
    assign(:real_time_full_screen, stub_model(RealTimeFullScreen,
      :name => "MyString",
      :public => false
    ).as_new_record)
  end

  it "renders new real_time_full_screen form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", real_time_full_screens_path, "post" do
      assert_select "input#real_time_full_screen_name[name=?]", "real_time_full_screen[name]"
      assert_select "input#real_time_full_screen_public[name=?]", "real_time_full_screen[public]"
    end
  end
end
