require 'spec_helper'

describe "organisation_users/show" do
  before(:each) do
    @organisation_user = assign(:organisation_user, stub_model(OrganisationUser,
      user: nil,
      organisation: nil,
      organisation_role: nil
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(//)
    rendered.should match(//)
    rendered.should match(//)
  end
end
