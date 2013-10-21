require 'spec_helper'

describe "reservation_rule_scopes/show" do
  before(:each) do
    @reservation_rule_scope = assign(:reservation_rule_scope, stub_model(ReservationRuleScope,
      :entity => nil,
      :name => "Name",
      :repetition_unit => nil
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(//)
    rendered.should match(/Name/)
    rendered.should match(//)
  end
end
