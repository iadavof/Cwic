require 'spec_helper'

describe "reservations/new" do
  before(:each) do
    assign(:reservation, stub_model(Reservation,
      :begins_at => "",
      :ends_at => "",
      :entity => "",
      :organisation_client => nil
    ).as_new_record)
  end

  it "renders new reservation form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", reservations_path, "post" do
      assert_select "input#reservation_begins_at[name=?]", "reservation[begins_at]"
      assert_select "input#reservation_ends_at[name=?]", "reservation[ends_at]"
      assert_select "input#reservation_entity[name=?]", "reservation[entity]"
      assert_select "input#reservation_organisation_client[name=?]", "reservation[organisation_client]"
    end
  end
end
