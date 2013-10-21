require "spec_helper"

describe ReservationRuleScopesController do
  describe "routing" do

    it "routes to #index" do
      get("/reservation_rule_scopes").should route_to("reservation_rule_scopes#index")
    end

    it "routes to #new" do
      get("/reservation_rule_scopes/new").should route_to("reservation_rule_scopes#new")
    end

    it "routes to #show" do
      get("/reservation_rule_scopes/1").should route_to("reservation_rule_scopes#show", :id => "1")
    end

    it "routes to #edit" do
      get("/reservation_rule_scopes/1/edit").should route_to("reservation_rule_scopes#edit", :id => "1")
    end

    it "routes to #create" do
      post("/reservation_rule_scopes").should route_to("reservation_rule_scopes#create")
    end

    it "routes to #update" do
      put("/reservation_rule_scopes/1").should route_to("reservation_rule_scopes#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/reservation_rule_scopes/1").should route_to("reservation_rule_scopes#destroy", :id => "1")
    end

  end
end
