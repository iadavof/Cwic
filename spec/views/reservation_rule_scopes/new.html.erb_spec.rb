require 'spec_helper'

describe "reservation_rule_scopes/new" do
  before(:each) do
    assign(:reservation_rule_scope, stub_model(ReservationRuleScope,
      :entity => nil,
      :name => "MyString",
      :repetition_unit => nil
    ).as_new_record)
  end

  it "renders new reservation_rule_scope form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", reservation_rule_scopes_path, "post" do
      assert_select "input#reservation_rule_scope_entity[name=?]", "reservation_rule_scope[entity]"
      assert_select "input#reservation_rule_scope_name[name=?]", "reservation_rule_scope[name]"
      assert_select "input#reservation_rule_scope_repetition_unit[name=?]", "reservation_rule_scope[repetition_unit]"
    end
  end
end
