require "spec_helper"

describe OrganisationUsersController do
  describe "routing" do

    it "routes to #index" do
      get("/organisation_users").should route_to("organisation_users#index")
    end

    it "routes to #new" do
      get("/organisation_users/new").should route_to("organisation_users#new")
    end

    it "routes to #show" do
      get("/organisation_users/1").should route_to("organisation_users#show", :id => "1")
    end

    it "routes to #edit" do
      get("/organisation_users/1/edit").should route_to("organisation_users#edit", :id => "1")
    end

    it "routes to #create" do
      post("/organisation_users").should route_to("organisation_users#create")
    end

    it "routes to #update" do
      put("/organisation_users/1").should route_to("organisation_users#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/organisation_users/1").should route_to("organisation_users#destroy", :id => "1")
    end

  end
end
