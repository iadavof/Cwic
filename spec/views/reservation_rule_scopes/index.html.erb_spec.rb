require 'spec_helper'

describe "reservation_rule_scopes/index" do
  before(:each) do
    assign(:reservation_rule_scopes, [
      stub_model(ReservationRuleScope,
        :entity => nil,
        :name => "Name",
        :repetition_unit => nil
      ),
      stub_model(ReservationRuleScope,
        :entity => nil,
        :name => "Name",
        :repetition_unit => nil
      )
    ])
  end

  it "renders a list of reservation_rule_scopes" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => nil.to_s, :count => 2
    assert_select "tr>td", :text => "Name".to_s, :count => 2
    assert_select "tr>td", :text => nil.to_s, :count => 2
  end
end
