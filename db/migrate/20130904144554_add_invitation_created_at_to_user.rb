class AddInvitationCreatedAtToUser < ActiveRecord::Migration
  def change
    add_column :users, :invitation_created_at, :datetime, after: :invitation_token
  end
end
