require 'spec_helper'

describe "feedbacks/show" do
  before(:each) do
    @feedback = assign(:feedback, stub_model(Feedback,
      :message => "MyText",
      :specs => "MyText",
      :screen_capture => "Screen Capture"
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/MyText/)
    rendered.should match(/MyText/)
    rendered.should match(/Screen Capture/)
  end
end
