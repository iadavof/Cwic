class CreateNewsletterSignups < ActiveRecord::Migration
  def change
    create_table :newsletter_signups do |t|
      t.string :email

      t.timestamps
    end
  end
end
