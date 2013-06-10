require "spec_helper"

describe EntityTypesController do
  describe "routing" do

    it "routes to #index" do
      get("/entity_types").should route_to("entity_types#index")
    end

    it "routes to #new" do
      get("/entity_types/new").should route_to("entity_types#new")
    end

    it "routes to #show" do
      get("/entity_types/1").should route_to("entity_types#show", :id => "1")
    end

    it "routes to #edit" do
      get("/entity_types/1/edit").should route_to("entity_types#edit", :id => "1")
    end

    it "routes to #create" do
      post("/entity_types").should route_to("entity_types#create")
    end

    it "routes to #update" do
      put("/entity_types/1").should route_to("entity_types#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/entity_types/1").should route_to("entity_types#destroy", :id => "1")
    end

  end
end
