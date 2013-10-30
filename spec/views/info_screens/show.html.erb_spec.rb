require 'spec_helper'

describe "info_screens/show" do
  before(:each) do
    @info_screen = assign(:info_screen, stub_model(InfoScreen,
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
