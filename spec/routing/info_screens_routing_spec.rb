require "spec_helper"

describe InfoScreensController do
  describe "routing" do

    it "routes to #index" do
      get("/info_screens").should route_to("info_screens#index")
    end

    it "routes to #new" do
      get("/info_screens/new").should route_to("info_screens#new")
    end

    it "routes to #show" do
      get("/info_screens/1").should route_to("info_screens#show", :id => "1")
    end

    it "routes to #edit" do
      get("/info_screens/1/edit").should route_to("info_screens#edit", :id => "1")
    end

    it "routes to #create" do
      post("/info_screens").should route_to("info_screens#create")
    end

    it "routes to #update" do
      put("/info_screens/1").should route_to("info_screens#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/info_screens/1").should route_to("info_screens#destroy", :id => "1")
    end

  end
end
