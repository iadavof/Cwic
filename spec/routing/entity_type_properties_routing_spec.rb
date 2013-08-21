require "spec_helper"

describe EntityTypePropertiesController do
  describe "routing" do

    it "routes to #index" do
      get("/entity_type_properties").should route_to("entity_type_properties#index")
    end

    it "routes to #new" do
      get("/entity_type_properties/new").should route_to("entity_type_properties#new")
    end

    it "routes to #show" do
      get("/entity_type_properties/1").should route_to("entity_type_properties#show", :id => "1")
    end

    it "routes to #edit" do
      get("/entity_type_properties/1/edit").should route_to("entity_type_properties#edit", :id => "1")
    end

    it "routes to #create" do
      post("/entity_type_properties").should route_to("entity_type_properties#create")
    end

    it "routes to #update" do
      put("/entity_type_properties/1").should route_to("entity_type_properties#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/entity_type_properties/1").should route_to("entity_type_properties#destroy", :id => "1")
    end

  end
end
