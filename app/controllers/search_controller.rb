class SearchController < ApplicationController
  def results
    relation = PgSearch.multisearch(params[:global_search])
    relation = relation.where(searchable_type: params[:global_search_type]) if params[:global_search_type].present?
    @results = relation
  end
end
