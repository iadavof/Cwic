require 'spec_helper'

describe "feedbacks/index" do
  before(:each) do
    assign(:feedbacks, [
      stub_model(Feedback,
        message: "MyText",
        specs: "MyText",
        screen_capture: "Screen Capture"
      ),
      stub_model(Feedback,
        message: "MyText",
        specs: "MyText",
        screen_capture: "Screen Capture"
      )
    ])
  end

  it "renders a list of feedbacks" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", text: "MyText".to_s, count: 2
    assert_select "tr>td", text: "MyText".to_s, count: 2
    assert_select "tr>td", text: "Screen Capture".to_s, count: 2
  end
end
