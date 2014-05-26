require "spec_helper"

describe EntityTypeIconsController do
  describe "routing" do

    it "routes to #index" do
      get("/entity_type_icons").should route_to("entity_type_icons#index")
    end

    it "routes to #new" do
      get("/entity_type_icons/new").should route_to("entity_type_icons#new")
    end

    it "routes to #show" do
      get("/entity_type_icons/1").should route_to("entity_type_icons#show", id: "1")
    end

    it "routes to #edit" do
      get("/entity_type_icons/1/edit").should route_to("entity_type_icons#edit", id: "1")
    end

    it "routes to #create" do
      post("/entity_type_icons").should route_to("entity_type_icons#create")
    end

    it "routes to #update" do
      put("/entity_type_icons/1").should route_to("entity_type_icons#update", id: "1")
    end

    it "routes to #destroy" do
      delete("/entity_type_icons/1").should route_to("entity_type_icons#destroy", id: "1")
    end

  end
end
