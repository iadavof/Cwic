require 'spec_helper'

describe "feedbacks/new" do
  before(:each) do
    assign(:feedback, stub_model(Feedback,
      message: "MyText",
      specs: "MyText",
      screen_capture: "MyString"
    ).as_new_record)
  end

  it "renders new feedback form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", feedbacks_path, "post" do
      assert_select "textarea#feedback_message[name=?]", "feedback[message]"
      assert_select "textarea#feedback_specs[name=?]", "feedback[specs]"
      assert_select "input#feedback_screen_capture[name=?]", "feedback[screen_capture]"
    end
  end
end
