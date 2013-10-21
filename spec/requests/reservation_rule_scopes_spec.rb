require 'spec_helper'

describe "ReservationRuleScopes" do
  describe "GET /reservation_rule_scopes" do
    it "works! (now write some real specs)" do
      # Run the generator again with the --webrat flag if you want to use webrat methods/matchers
      get reservation_rule_scopes_path
      response.status.should be(200)
    end
  end
end
