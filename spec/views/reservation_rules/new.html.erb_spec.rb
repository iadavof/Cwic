require 'spec_helper'

describe "reservation_rules/new" do
  before(:each) do
    assign(:reservation_rule, stub_model(ReservationRule,
      :scope => nil,
      :reserve_by => "MyString",
      :period_unit => nil,
      :period_amount => 1,
      :min_periods => 1,
      :max_periods => 1,
      :price => "9.99",
      :price_per => "MyString",
      :price_period_unit => nil,
      :price_period_amount => 1
    ).as_new_record)
  end

  it "renders new reservation_rule form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", reservation_rules_path, "post" do
      assert_select "input#reservation_rule_scope[name=?]", "reservation_rule[scope]"
      assert_select "input#reservation_rule_reserve_by[name=?]", "reservation_rule[reserve_by]"
      assert_select "input#reservation_rule_period_unit[name=?]", "reservation_rule[period_unit]"
      assert_select "input#reservation_rule_period_amount[name=?]", "reservation_rule[period_amount]"
      assert_select "input#reservation_rule_min_periods[name=?]", "reservation_rule[min_periods]"
      assert_select "input#reservation_rule_max_periods[name=?]", "reservation_rule[max_periods]"
      assert_select "input#reservation_rule_price[name=?]", "reservation_rule[price]"
      assert_select "input#reservation_rule_price_per[name=?]", "reservation_rule[price_per]"
      assert_select "input#reservation_rule_price_period_unit[name=?]", "reservation_rule[price_period_unit]"
      assert_select "input#reservation_rule_price_period_amount[name=?]", "reservation_rule[price_period_amount]"
    end
  end
end
