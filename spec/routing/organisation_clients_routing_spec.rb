require "spec_helper"

describe OrganisationClientsController do
  describe "routing" do

    it "routes to #index" do
      get("/organisation_clients").should route_to("organisation_clients#index")
    end

    it "routes to #new" do
      get("/organisation_clients/new").should route_to("organisation_clients#new")
    end

    it "routes to #show" do
      get("/organisation_clients/1").should route_to("organisation_clients#show", :id => "1")
    end

    it "routes to #edit" do
      get("/organisation_clients/1/edit").should route_to("organisation_clients#edit", :id => "1")
    end

    it "routes to #create" do
      post("/organisation_clients").should route_to("organisation_clients#create")
    end

    it "routes to #update" do
      put("/organisation_clients/1").should route_to("organisation_clients#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/organisation_clients/1").should route_to("organisation_clients#destroy", :id => "1")
    end

  end
end
