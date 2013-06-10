require 'spec_helper'

describe "property_types/show" do
  before(:each) do
    @property_type = assign(:property_type, stub_model(PropertyType,
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
