require 'spec_helper'

describe "organisation_users/edit" do
  before(:each) do
    @organisation_user = assign(:organisation_user, stub_model(OrganisationUser,
      user: nil,
      organisation: nil,
      organisation_role: nil
    ))
  end

  it "renders the edit organisation_user form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", organisation_user_path(@organisation_user), "post" do
      assert_select "input#organisation_user_user[name=?]", "organisation_user[user]"
      assert_select "input#organisation_user_organisation[name=?]", "organisation_user[organisation]"
      assert_select "input#organisation_user_organisation_role[name=?]", "organisation_user[organisation_role]"
    end
  end
end
