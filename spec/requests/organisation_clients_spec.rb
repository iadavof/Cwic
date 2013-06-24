require 'spec_helper'

describe "OrganisationClients" do
  describe "GET /organisation_clients" do
    it "works! (now write some real specs)" do
      # Run the generator again with the --webrat flag if you want to use webrat methods/matchers
      get organisation_clients_path
      response.status.should be(200)
    end
  end
end
