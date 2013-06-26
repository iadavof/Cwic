require 'spec_helper'

describe "organisation_clients/index" do
  before(:each) do
    assign(:organisation_clients, [
      stub_model(OrganisationClient,
        :first_name => "",
        :infix => "",
        :last_name => "",
        :email => "Email"
      ),
      stub_model(OrganisationClient,
        :first_name => "",
        :infix => "",
        :last_name => "",
        :email => "Email"
      )
    ])
  end

  it "renders a list of organisation_clients" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => "".to_s, :count => 2
    assert_select "tr>td", :text => "".to_s, :count => 2
    assert_select "tr>td", :text => "".to_s, :count => 2
    assert_select "tr>td", :text => "Email".to_s, :count => 2
  end
end
