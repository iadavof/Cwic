require 'spec_helper'

describe "entities/show" do
  before(:each) do
    @entity = assign(:entity, stub_model(Entity,
      :name => "Name",
      :description => "MyText",
      :entity_type => nil,
      :organisation => nil
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Name/)
    rendered.should match(/MyText/)
    rendered.should match(//)
    rendered.should match(//)
  end
end
