require 'spec_helper'

describe "reservation_rules/show" do
  before(:each) do
    @reservation_rule = assign(:reservation_rule, stub_model(ReservationRule,
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
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(//)
    rendered.should match(/Reserve By/)
    rendered.should match(//)
    rendered.should match(/1/)
    rendered.should match(/2/)
    rendered.should match(/3/)
    rendered.should match(/9.99/)
    rendered.should match(/Price Per/)
    rendered.should match(//)
    rendered.should match(/4/)
  end
end
