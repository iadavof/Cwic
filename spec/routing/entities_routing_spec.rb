require "spec_helper"

describe EntitiesController do
  describe "routing" do

    it "routes to #index" do
      get("/entities").should route_to("entities#index")
    end

    it "routes to #new" do
      get("/entities/new").should route_to("entities#new")
    end

    it "routes to #show" do
      get("/entities/1").should route_to("entities#show", :id => "1")
    end

    it "routes to #edit" do
      get("/entities/1/edit").should route_to("entities#edit", :id => "1")
    end

    it "routes to #create" do
      post("/entities").should route_to("entities#create")
    end

    it "routes to #update" do
      put("/entities/1").should route_to("entities#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/entities/1").should route_to("entities#destroy", :id => "1")
    end

  end
end
