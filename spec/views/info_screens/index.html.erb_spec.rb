require 'spec_helper'

describe "info_screens/index" do
  before(:each) do
    assign(:info_screens, [
      stub_model(InfoScreen,
        name: "Name",
        public: false
      ),
      stub_model(InfoScreen,
        name: "Name",
        public: false
      )
    ])
  end

  it "renders a list of info_screens" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", text: "Name".to_s, count: 2
    assert_select "tr>td", text: false.to_s, count: 2
  end
end
