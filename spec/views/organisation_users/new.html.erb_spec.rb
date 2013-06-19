require 'spec_helper'

describe "organisation_users/new" do
  before(:each) do
    assign(:organisation_user, stub_model(OrganisationUser,
      :user => nil,
      :organisation => nil,
      :organisation_role => nil
    ).as_new_record)
  end

  it "renders new organisation_user form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", organisation_users_path, "post" do
      assert_select "input#organisation_user_user[name=?]", "organisation_user[user]"
      assert_select "input#organisation_user_organisation[name=?]", "organisation_user[organisation]"
      assert_select "input#organisation_user_organisation_role[name=?]", "organisation_user[organisation_role]"
    end
  end
end
