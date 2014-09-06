class OccupationViewController < ApplicationController
	before_action :load_resource, if: -> { request.xhr? } # Retrieve the Occupation data only for AJAX/JSON requests

	respond_to :json

	def day
		respond_with(@occupations) do |format|
			format.html { render }
			format.json { render template: 'occupation_view/occupations' }
		end
	end

	def week
		respond_with(@occupations) do |format|
			format.html { render }
			format.json { render template: 'occupation_view/occupations' }
		end
	end

private
	def load_resource
		case params[:action]
		when 'day'
			date = Date.new(params[:year].to_i, params[:month].to_i)
			@occupations = DayOccupation.where(entity: @organisation.entities, day: date.beginning_of_month..date.end_of_month)
		when 'week'
			@occupations = WeekOccupation.where(entity: @organisation.entities, year: params[:year])
		end
	end
end
