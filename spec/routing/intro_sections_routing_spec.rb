require "spec_helper"

describe IntroSectionsController do
  describe "routing" do

    it "routes to #index" do
      get("/intro_sections").should route_to("intro_sections#index")
    end

    it "routes to #new" do
      get("/intro_sections/new").should route_to("intro_sections#new")
    end

    it "routes to #show" do
      get("/intro_sections/1").should route_to("intro_sections#show", :id => "1")
    end

    it "routes to #edit" do
      get("/intro_sections/1/edit").should route_to("intro_sections#edit", :id => "1")
    end

    it "routes to #create" do
      post("/intro_sections").should route_to("intro_sections#create")
    end

    it "routes to #update" do
      put("/intro_sections/1").should route_to("intro_sections#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/intro_sections/1").should route_to("intro_sections#destroy", :id => "1")
    end

  end
end
