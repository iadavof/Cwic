require 'spec_helper'

describe "entity_type_icons/show" do
  before(:each) do
    @entity_type_icon = assign(:entity_type_icon, stub_model(EntityTypeIcon,
      name: "Name",
      organisation: nil
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Name/)
    rendered.should match(//)
  end
end
