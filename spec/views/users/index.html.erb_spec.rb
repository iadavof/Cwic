require 'spec_helper'

describe "users/index" do
  before(:each) do
    assign(:users, [
      stub_model(User,
        :first_name => "First Name",
        :infix => "Infix",
        :last_name => "Last Name",
        :email => "Email",
        :sign_in_count => 1
      ),
      stub_model(User,
        :first_name => "First Name",
        :infix => "Infix",
        :last_name => "Last Name",
        :email => "Email",
        :sign_in_count => 1
      )
    ])
  end

  it "renders a list of users" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => "First Name".to_s, :count => 2
    assert_select "tr>td", :text => "Infix".to_s, :count => 2
    assert_select "tr>td", :text => "Last Name".to_s, :count => 2
    assert_select "tr>td", :text => "Email".to_s, :count => 2
    assert_select "tr>td", :text => 1.to_s, :count => 2
  end
end
