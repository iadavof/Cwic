require 'spec_helper'

describe "intro_sections/index" do
  before(:each) do
    assign(:intro_sections, [
      stub_model(IntroSection,
        :title => "Title",
        :body => "MyText",
        :image => "Image",
        :weight => "",
        :background-color => "Background Color"
      ),
      stub_model(IntroSection,
        :title => "Title",
        :body => "MyText",
        :image => "Image",
        :weight => "",
        :background-color => "Background Color"
      )
    ])
  end

  it "renders a list of intro_sections" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => "Title".to_s, :count => 2
    assert_select "tr>td", :text => "MyText".to_s, :count => 2
    assert_select "tr>td", :text => "Image".to_s, :count => 2
    assert_select "tr>td", :text => "".to_s, :count => 2
    assert_select "tr>td", :text => "Background Color".to_s, :count => 2
  end
end
