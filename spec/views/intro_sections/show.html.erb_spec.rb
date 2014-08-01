require 'spec_helper'

describe "intro_sections/show" do
  before(:each) do
    @intro_section = assign(:intro_section, stub_model(IntroSection,
      :title => "Title",
      :body => "MyText",
      :image => "Image",
      :weight => "",
      :background-color => "Background Color"
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Title/)
    rendered.should match(/MyText/)
    rendered.should match(/Image/)
    rendered.should match(//)
    rendered.should match(/Background Color/)
  end
end
