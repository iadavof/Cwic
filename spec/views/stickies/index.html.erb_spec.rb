require 'spec_helper'

describe "stickies/index" do
  before(:each) do
    assign(:stickies, [
      stub_model(Sticky,
        stickable: nil,
        user: nil,
        sticky_text: "MyText",
        pos_x: 1.5,
        pos_y: 1.5,
        width: 1.5,
        height: 1.5
      ),
      stub_model(Sticky,
        stickable: nil,
        user: nil,
        sticky_text: "MyText",
        pos_x: 1.5,
        pos_y: 1.5,
        width: 1.5,
        height: 1.5
      )
    ])
  end

  it "renders a list of stickies" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", text: nil.to_s, count: 2
    assert_select "tr>td", text: nil.to_s, count: 2
    assert_select "tr>td", text: "MyText".to_s, count: 2
    assert_select "tr>td", text: 1.5.to_s, count: 2
    assert_select "tr>td", text: 1.5.to_s, count: 2
    assert_select "tr>td", text: 1.5.to_s, count: 2
    assert_select "tr>td", text: 1.5.to_s, count: 2
  end
end
