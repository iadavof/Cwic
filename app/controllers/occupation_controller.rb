class OccupationController < ApplicationController

	def day_occupation
		render :day_occupation
	end

	def week_occupation
		render :week_occupation
	end

	def entities
	result = []
	@organisation.entities.each do |e|
	  result << {
	              id: e.id,
	              icon: e.entity_type.icon.image.icon.url,
	              name: e.instance_name,
	              color: e.color,
	            }
	end
	render json: { entities: result }, status: :ok
	end

	def day_occupation_percentages
		result = [];
		if params[:month].present? && params[:year].present?
			start = params[:month].to_i
			start = params[:year].to_i
			@entities = @organisation.entities;

		else
			render status: :error
		end

	end

end
