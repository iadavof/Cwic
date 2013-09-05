require "spec_helper"

describe StickiesController do
  describe "routing" do

    it "routes to #index" do
      get("/stickies").should route_to("stickies#index")
    end

    it "routes to #new" do
      get("/stickies/new").should route_to("stickies#new")
    end

    it "routes to #show" do
      get("/stickies/1").should route_to("stickies#show", :id => "1")
    end

    it "routes to #edit" do
      get("/stickies/1/edit").should route_to("stickies#edit", :id => "1")
    end

    it "routes to #create" do
      post("/stickies").should route_to("stickies#create")
    end

    it "routes to #update" do
      put("/stickies/1").should route_to("stickies#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/stickies/1").should route_to("stickies#destroy", :id => "1")
    end

  end
end
