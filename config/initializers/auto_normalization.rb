Cwic::Application.config.after_initialize do
  Dir.glob("#{Rails.root}/app/models/*.rb").each do |file|
    # Include the AutoNormalizable concern for every ActiveRecord model.
    # Note: we cannot simply add this to ActiveRecord::Base, because the model's database columns need to be known when the concern is included.
    model_name = File.basename(file, '.rb').classify
    next unless ActiveRecord::Base.connection.table_exists?(model_name.tableize)
    model = model_name.constantize
    model.send(:include, AutoNormalizable) if model < ActiveRecord::Base && model.table_exists?
  end
end
