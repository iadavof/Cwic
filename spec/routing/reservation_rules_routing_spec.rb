require "spec_helper"

describe ReservationRulesController do
  describe "routing" do

    it "routes to #index" do
      get("/reservation_rules").should route_to("reservation_rules#index")
    end

    it "routes to #new" do
      get("/reservation_rules/new").should route_to("reservation_rules#new")
    end

    it "routes to #show" do
      get("/reservation_rules/1").should route_to("reservation_rules#show", :id => "1")
    end

    it "routes to #edit" do
      get("/reservation_rules/1/edit").should route_to("reservation_rules#edit", :id => "1")
    end

    it "routes to #create" do
      post("/reservation_rules").should route_to("reservation_rules#create")
    end

    it "routes to #update" do
      put("/reservation_rules/1").should route_to("reservation_rules#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/reservation_rules/1").should route_to("reservation_rules#destroy", :id => "1")
    end

  end
end
