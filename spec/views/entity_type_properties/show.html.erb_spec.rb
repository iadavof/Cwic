require 'spec_helper'

describe "entity_type_properties/show" do
  before(:each) do
    @entity_type_property = assign(:entity_type_property, stub_model(EntityTypeProperty,
      :entity_type => nil,
      :name => "Name",
      :description => "MyText",
      :data_type => nil
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(//)
    rendered.should match(/Name/)
    rendered.should match(/MyText/)
    rendered.should match(//)
  end
end
