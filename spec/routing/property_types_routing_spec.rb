require "spec_helper"

describe PropertyTypesController do
  describe "routing" do

    it "routes to #index" do
      get("/property_types").should route_to("property_types#index")
    end

    it "routes to #new" do
      get("/property_types/new").should route_to("property_types#new")
    end

    it "routes to #show" do
      get("/property_types/1").should route_to("property_types#show", :id => "1")
    end

    it "routes to #edit" do
      get("/property_types/1/edit").should route_to("property_types#edit", :id => "1")
    end

    it "routes to #create" do
      post("/property_types").should route_to("property_types#create")
    end

    it "routes to #update" do
      put("/property_types/1").should route_to("property_types#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/property_types/1").should route_to("property_types#destroy", :id => "1")
    end

  end
end
