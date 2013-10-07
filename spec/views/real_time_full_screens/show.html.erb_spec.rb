require 'spec_helper'

describe "real_time_full_screens/show" do
  before(:each) do
    @real_time_full_screen = assign(:real_time_full_screen, stub_model(RealTimeFullScreen,
      :name => "Name",
      :public => false
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Name/)
    rendered.should match(/false/)
  end
end
