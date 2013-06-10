require 'spec_helper'

describe "entity_types/show" do
  before(:each) do
    @entity_type = assign(:entity_type, stub_model(EntityType,
      :name => "Name",
      :description => "MyText"
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Name/)
    rendered.should match(/MyText/)
  end
end
