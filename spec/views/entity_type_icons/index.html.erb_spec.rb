require 'spec_helper'

describe "entity_type_icons/index" do
  before(:each) do
    assign(:entity_type_icons, [
      stub_model(EntityTypeIcon,
        :name => "Name",
        :organisation => nil
      ),
      stub_model(EntityTypeIcon,
        :name => "Name",
        :organisation => nil
      )
    ])
  end

  it "renders a list of entity_type_icons" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => "Name".to_s, :count => 2
    assert_select "tr>td", :text => nil.to_s, :count => 2
  end
end
