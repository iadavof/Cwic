require "spec_helper"

describe RealTimeFullScreensController do
  describe "routing" do

    it "routes to #index" do
      get("/real_time_full_screens").should route_to("real_time_full_screens#index")
    end

    it "routes to #new" do
      get("/real_time_full_screens/new").should route_to("real_time_full_screens#new")
    end

    it "routes to #show" do
      get("/real_time_full_screens/1").should route_to("real_time_full_screens#show", :id => "1")
    end

    it "routes to #edit" do
      get("/real_time_full_screens/1/edit").should route_to("real_time_full_screens#edit", :id => "1")
    end

    it "routes to #create" do
      post("/real_time_full_screens").should route_to("real_time_full_screens#create")
    end

    it "routes to #update" do
      put("/real_time_full_screens/1").should route_to("real_time_full_screens#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/real_time_full_screens/1").should route_to("real_time_full_screens#destroy", :id => "1")
    end

  end
end
