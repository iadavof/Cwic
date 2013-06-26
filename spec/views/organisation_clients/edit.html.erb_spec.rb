require 'spec_helper'

describe "organisation_clients/edit" do
  before(:each) do
    @organisation_client = assign(:organisation_client, stub_model(OrganisationClient,
      :first_name => "",
      :infix => "",
      :last_name => "",
      :email => "MyString"
    ))
  end

  it "renders the edit organisation_client form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", organisation_client_path(@organisation_client), "post" do
      assert_select "input#organisation_client_first_name[name=?]", "organisation_client[first_name]"
      assert_select "input#organisation_client_infix[name=?]", "organisation_client[infix]"
      assert_select "input#organisation_client_last_name[name=?]", "organisation_client[last_name]"
      assert_select "input#organisation_client_email[name=?]", "organisation_client[email]"
    end
  end
end
