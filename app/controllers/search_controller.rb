class SearchController < ApplicationController
  SEARCHABLE = [OrganisationClient, Reservation, Entity, EntityType]

  def results
    @query = params[:global_search]

    # Determine the object types to search in
    types = (params[:global_search_type].present? && SEARCHABLE.include?(params[:global_search_type].constantize)) ? [params[:global_search_type].constantize] : SEARCHABLE

    # Determine matching object ids
    results = []
    types.each do |t|
      rel = t.global_search(@query) # Apply search query using global search to every searchable type
      rel = rel.where(organisation: @organisation) # Only for items within the organisation
      rel = rel.pluck(:id, t.global_search_scope_options(@query).rank_sql) # Get only the ids of the objects + their rank (to order)
      results += rel.map { |res| { type: t, id: res.first, rank: res.second } } # Refactor results to hash which contains type, id and rank. All needed to retrieve objects and/or order the results.
    end

    # Sort and paginate
    @count = results.count
    results = results.sort_by { |res| res[:rank] }.reverse # Sort by the rank
    results = Kaminari.paginate_array(results).page(params[:page])
    @raw_results = results

    # Transform results to ids per type
    results_by_type = results.group_by { |res| res[:type] }

    # Retrieve objects in this set
    objects = Hash[results_by_type.map { |type, results| [type, type.find(results.map { |res| res[:id] }).index_by { |res| res[:id] }] }]

    # Map result ids to objects
    @results = results.map { |res| objects[res[:type]][res[:id]].tap { |o| o.pg_search_rank = res[:rank] } }

    respond_with(@results)
  end
end
