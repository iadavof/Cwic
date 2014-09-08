# Dir.glob("#{Rails.root}/app/models/*.rb").each do |file|
#   # Include the AutoNormalizable concern for every ActiveRecord model.
#   # Note: we cannot use ActiveRecord::Base for this, because when including the concern the model's database columns need to be known.
#   model_name = File.basename(file, '.rb').classify
#   next if ['User'].include?(model_name) # Skip the User model. It does not work for some strange reason (related to Devise).
#   model = model_name.constantize
#   model.send(:include, AutoNormalizable) if model < ActiveRecord::Base
# end
