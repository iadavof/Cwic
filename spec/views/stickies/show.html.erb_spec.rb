require 'spec_helper'

describe "stickies/show" do
  before(:each) do
    @sticky = assign(:sticky, stub_model(Sticky,
      :stickable => nil,
      :user => nil,
      :sticky_text => "MyText",
      :pos_x => 1.5,
      :pos_y => 1.5,
      :width => 1.5,
      :height => 1.5
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(//)
    rendered.should match(//)
    rendered.should match(/MyText/)
    rendered.should match(/1.5/)
    rendered.should match(/1.5/)
    rendered.should match(/1.5/)
    rendered.should match(/1.5/)
  end
end
