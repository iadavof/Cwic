require 'spec_helper'

describe "intro_sections/edit" do
  before(:each) do
    @intro_section = assign(:intro_section, stub_model(IntroSection,
      :title => "MyString",
      :body => "MyText",
      :image => "MyString",
      :weight => "",
      :background-color => "MyString"
    ))
  end

  it "renders the edit intro_section form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", intro_section_path(@intro_section), "post" do
      assert_select "input#intro_section_title[name=?]", "intro_section[title]"
      assert_select "textarea#intro_section_body[name=?]", "intro_section[body]"
      assert_select "input#intro_section_image[name=?]", "intro_section[image]"
      assert_select "input#intro_section_weight[name=?]", "intro_section[weight]"
      assert_select "input#intro_section_background-color[name=?]", "intro_section[background-color]"
    end
  end
end
