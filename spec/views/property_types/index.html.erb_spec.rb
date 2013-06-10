require 'spec_helper'

describe "property_types/index" do
  before(:each) do
    assign(:property_types, [
      stub_model(PropertyType,
        :entity_type => nil,
        :name => "Name",
        :description => "MyText",
        :data_type => nil
      ),
      stub_model(PropertyType,
        :entity_type => nil,
        :name => "Name",
        :description => "MyText",
        :data_type => nil
      )
    ])
  end

  it "renders a list of property_types" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => nil.to_s, :count => 2
    assert_select "tr>td", :text => "Name".to_s, :count => 2
    assert_select "tr>td", :text => "MyText".to_s, :count => 2
    assert_select "tr>td", :text => nil.to_s, :count => 2
  end
end
