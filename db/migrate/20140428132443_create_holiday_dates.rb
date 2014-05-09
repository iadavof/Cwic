class CreateHolidayDates < ActiveRecord::Migration
  def change
    create_table :holiday_dates do |t|
      t.references :holiday, index: true
      t.date :date

      t.timestamps
    end
  end
end
