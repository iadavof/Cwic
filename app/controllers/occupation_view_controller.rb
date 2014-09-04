class OccupationViewController < ApplicationController
	before_action :load_resource

	respond_to :html, only: [:day, :week]
	respond_to :json, except: [:day, :week]

	def day
		render
	end

	def week
		render
	end

	def entities
		result = []
		@entities.each do |e|
		  result << {
		              id: e.id,
		              icon: e.entity_type.icon.image.icon.url,
		              name: e.full_instance_name,
		              color: e.color,
		            }
		end
		render json: { entities: result }, status: :ok
	end

	def day_occupation_percentages
		result = [];
		if params[:month].present? && params[:year].present?
			month = params[:month].to_i
			year = params[:year].to_i
			@entities.each do |e|
				result << {
					entity_id: e.id,
					days: day_percentages_for_entity(e, month, year),
				}
			end
			render json: { entities: result }, status: :ok
		else
			render json: {}, status: :error
		end
	end

	def week_occupation_percentages
		result = [];
		if params[:year].present?
			year = params[:year].to_i
			@entities.each do |e|
				result << {
					entity_id: e.id,
					weeks: week_percentages_for_entity(e, year),
				}
			end
			render json: { entities: result }, status: :ok
		else
			render json: {}, status: :error
		end
	end

private
	def load_resource
		case params[:action]
		when 'entities'
			@entities = @organisation.entities.includes(entity_type: :icon)
		when 'day_occupation_percentages', 'week_occupation_percentages'
			@entities = @organisation.entities
		end
	end

	def day_percentages_for_entity(entity, month, year)
		result = []
		start_date = Date.new(year, month).beginning_of_month;
		end_date = Date.new(year, month).end_of_month;
		current_occupations = entity.day_occupations.where('day BETWEEN :start_date AND :stop_date', start_date: start_date, stop_date: end_date)
		current_occupations.each do |oc|
			result <<  {
				nr: oc.day.day,
				percent: oc.occupation,
			}
		end
		result
	end

	def week_percentages_for_entity(entity, year)
		result = []
		current_occupations = entity.week_occupations.where('year = :year', year: year)
		current_occupations.each do |oc|
			result <<  {
				nr: oc.week,
				percent: oc.occupation,
			}
		end
		result
	end
end
