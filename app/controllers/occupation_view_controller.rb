class OccupationViewController < ApplicationController
  respond_to :json

  def day
    respond_with(@occupations) do |format|
      format.html { render }
      format.json { render_day_json }
    end
  end

  def week
    respond_with(@occupations) do |format|
      format.html { render }
      format.json { render_week_json }
    end
  end

private
  def render_day_json
    date = Date.new(params[:year].to_i, params[:month].to_i)
    day_range = (date.beginning_of_month..date.end_of_month)
    @occupations = DayOccupation.where(entity: @organisation.entities, day: day_range)
    render template: 'occupation_view/occupations'
  end

  def render_week_json
    @occupations = WeekOccupation.where(entity: @organisation.entities, year: params[:year])
    render template: 'occupation_view/occupations'
  end
end
