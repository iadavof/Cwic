class SearchController < ApplicationController
  SEARCHABLE = [OrganisationClient, Reservation, Entity, EntityType]

  def global
    @query = params[:global_search]

    # Determine the object types to search in
    types = (params[:global_search_type].present? && SEARCHABLE.include?(params[:global_search_type].constantize)) ? [params[:global_search_type].constantize] : SEARCHABLE

    # Get search key or generate a new one
    @search_key = (params[:search_key].present? ? params[:search_key] : generate_search_key())

    # Get the raw results
    results = Rails.cache.fetch(cache_key(@search_key), expires_in: 5.minutes) do
      # Determine matching object ids. First build the query parts
      sql_parts = []
      types.each do |t|
        rel = t.global_search(@query) # Apply search query using global search to every searchable type
        rel = rel.where(organisation: @organisation) # Only for items within the organisation
        rel = rel.except(:select).select("'#{t.to_s}' AS type", "#{t.table_name}.id", t.global_search_scope_options(@query).rank_sql)
        rel = rel.reorder(nil) # Remove orders (default order and pg_search order), because we do this later in the union
        sql_parts << rel.to_sql
      end

      # Combine the query parts into a large, sorted UNION query
      sql = "(" + sql_parts.join(") UNION (") + ") ORDER BY pg_search_rank DESC, id ASC"

      # Execute the query
      results = ActiveRecord::Base.connection.select_rows(sql)

      # Map the retrieved results to hashes of type, id and rank.
      results.map { |res| { type: res.first.to_s, id: res.second.to_i, rank: res.third.to_f } }
    end

    # Paginate the results
    results = Kaminari.paginate_array(results).page(params[:page])
    @raw_results = results

    # Transform the results subset to ids per type
    results_by_type = results.group_by { |res| res[:type] }

    # Retrieve objects in this subset
    objects = Hash[results_by_type.map { |type, res| [type, type.constantize.includes(includes_for_type(type)).find(res.map { |r| r[:id] }).index_by { |r| r[:id] }] }]

    # Map result ids to objects
    @results = results.map { |res| objects[res[:type]][res[:id]].tap { |o| o.pg_search_rank = res[:rank] } }

    # Get the tags that are like the query
    @tag_suggestions = @organisation.owned_tags_with_part(@query)

    respond_with(@raw_results, @results, @tag_suggestions)
  end

  def tag
    @tag_query = params[:tag_query].downcase
    @taggables = []
    if ActsAsTaggableOn::Tag.find_by(name: @tag_query).present?
      @raw_results = ActsAsTaggableOn::Tag.find_by(name: @tag_query).taggings.where(tagger_type: 'Organisation', tagger_id: 1, taggable_type: SEARCHABLE).page(params[:page])
      @taggables = @raw_results.map(&:taggable)
    end
    respond_with(@raw_results, @taggables)
  end

private
  def generate_search_key
    # Generate new unique search key
    begin
      search_key = rand(1000000000)
    end while Rails.cache.exist?(cache_key(search_key))
    search_key
  end

  def cache_key(search_key)
    "search_results_#{request.session_options[:id]}_#{search_key}"
  end

  def includes_for_type(type)
    case type
    when 'Reservation'
      [:reservation_status, :entity, :organisation_client]
    when 'Entity'
      [:entity_type, :images]
    when 'EntityType'
      [:images]
    end
  end
end
