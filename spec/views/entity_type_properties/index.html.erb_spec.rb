require 'spec_helper'

describe "entity_type_properties/index" do
  before(:each) do
    assign(:entity_type_properties, [
      stub_model(EntityTypeProperty,
        :entity_type => nil,
        :name => "Name",
        :description => "MyText",
        :data_type => nil
      ),
      stub_model(EntityTypeProperty,
        :entity_type => nil,
        :name => "Name",
        :description => "MyText",
        :data_type => nil
      )
    ])
  end

  it "renders a list of entity_type_properties" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => nil.to_s, :count => 2
    assert_select "tr>td", :text => "Name".to_s, :count => 2
    assert_select "tr>td", :text => "MyText".to_s, :count => 2
    assert_select "tr>td", :text => nil.to_s, :count => 2
  end
end
