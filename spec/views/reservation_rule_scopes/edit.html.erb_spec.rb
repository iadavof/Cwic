require 'spec_helper'

describe "reservation_rule_scopes/edit" do
  before(:each) do
    @reservation_rule_scope = assign(:reservation_rule_scope, stub_model(ReservationRuleScope,
      :entity => nil,
      :name => "MyString",
      :repetition_unit => nil
    ))
  end

  it "renders the edit reservation_rule_scope form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", reservation_rule_scope_path(@reservation_rule_scope), "post" do
      assert_select "input#reservation_rule_scope_entity[name=?]", "reservation_rule_scope[entity]"
      assert_select "input#reservation_rule_scope_name[name=?]", "reservation_rule_scope[name]"
      assert_select "input#reservation_rule_scope_repetition_unit[name=?]", "reservation_rule_scope[repetition_unit]"
    end
  end
end
