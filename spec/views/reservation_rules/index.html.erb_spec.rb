require 'spec_helper'

describe "reservation_rules/index" do
  before(:each) do
    assign(:reservation_rules, [
      stub_model(ReservationRule,
        :scope => nil,
        :reserve_by => "Reserve By",
        :period_unit => nil,
        :period_amount => 1,
        :min_periods => 2,
        :max_periods => 3,
        :price => "9.99",
        :price_per => "Price Per",
        :price_period_unit => nil,
        :price_period_amount => 4
      ),
      stub_model(ReservationRule,
        :scope => nil,
        :reserve_by => "Reserve By",
        :period_unit => nil,
        :period_amount => 1,
        :min_periods => 2,
        :max_periods => 3,
        :price => "9.99",
        :price_per => "Price Per",
        :price_period_unit => nil,
        :price_period_amount => 4
      )
    ])
  end

  it "renders a list of reservation_rules" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => nil.to_s, :count => 2
    assert_select "tr>td", :text => "Reserve By".to_s, :count => 2
    assert_select "tr>td", :text => nil.to_s, :count => 2
    assert_select "tr>td", :text => 1.to_s, :count => 2
    assert_select "tr>td", :text => 2.to_s, :count => 2
    assert_select "tr>td", :text => 3.to_s, :count => 2
    assert_select "tr>td", :text => "9.99".to_s, :count => 2
    assert_select "tr>td", :text => "Price Per".to_s, :count => 2
    assert_select "tr>td", :text => nil.to_s, :count => 2
    assert_select "tr>td", :text => 4.to_s, :count => 2
  end
end
