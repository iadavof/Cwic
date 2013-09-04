require 'spec_helper'

describe "users/new" do
  before(:each) do
    assign(:user, stub_model(User,
      :first_name => "MyString",
      :infix => "MyString",
      :last_name => "MyString",
      :email => "MyString",
      :sign_in_count => 1
    ).as_new_record)
  end

  it "renders new user form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", users_path, "post" do
      assert_select "input#user_first_name[name=?]", "user[first_name]"
      assert_select "input#user_infix[name=?]", "user[infix]"
      assert_select "input#user_last_name[name=?]", "user[last_name]"
      assert_select "input#user_email[name=?]", "user[email]"
      assert_select "input#user_sign_in_count[name=?]", "user[sign_in_count]"
    end
  end
end
