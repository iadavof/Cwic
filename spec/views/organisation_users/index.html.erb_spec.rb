require 'spec_helper'

describe "organisation_users/index" do
  before(:each) do
    assign(:organisation_users, [
      stub_model(OrganisationUser,
        :user => nil,
        :organisation => nil,
        :organisation_role => nil
      ),
      stub_model(OrganisationUser,
        :user => nil,
        :organisation => nil,
        :organisation_role => nil
      )
    ])
  end

  it "renders a list of organisation_users" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => nil.to_s, :count => 2
    assert_select "tr>td", :text => nil.to_s, :count => 2
    assert_select "tr>td", :text => nil.to_s, :count => 2
  end
end
