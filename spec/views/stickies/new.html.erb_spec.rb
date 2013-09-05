require 'spec_helper'

describe "stickies/new" do
  before(:each) do
    assign(:sticky, stub_model(Sticky,
      :stickable => nil,
      :user => nil,
      :sticky_text => "MyText",
      :pos_x => 1.5,
      :pos_y => 1.5,
      :width => 1.5,
      :height => 1.5
    ).as_new_record)
  end

  it "renders new sticky form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", stickies_path, "post" do
      assert_select "input#sticky_stickable[name=?]", "sticky[stickable]"
      assert_select "input#sticky_user[name=?]", "sticky[user]"
      assert_select "textarea#sticky_sticky_text[name=?]", "sticky[sticky_text]"
      assert_select "input#sticky_pos_x[name=?]", "sticky[pos_x]"
      assert_select "input#sticky_pos_y[name=?]", "sticky[pos_y]"
      assert_select "input#sticky_width[name=?]", "sticky[width]"
      assert_select "input#sticky_height[name=?]", "sticky[height]"
    end
  end
end
