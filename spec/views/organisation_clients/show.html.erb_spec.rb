require 'spec_helper'

describe "organisation_clients/show" do
  before(:each) do
    @organisation_client = assign(:organisation_client, stub_model(OrganisationClient,
      :first_name => "",
      :infix => "",
      :last_name => "",
      :email => "Email"
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(//)
    rendered.should match(//)
    rendered.should match(//)
    rendered.should match(/Email/)
  end
end
