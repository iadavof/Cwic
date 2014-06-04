class Cwic::Knapsack
  # Items is a hash with (atleast) these keys:
  # - p: the profit of the item (in case we want to find the maximum profit). Finding the maximum profit is not supported at the moment, but we can transform (negative) profits to costs and then find the minimum cost.
  # - c: the cost of the item (in case we want to find the minimum cost).
  # - w: the weight the item.
  # - a: how many times this item can be used (nil or absent means unlimited). Not supported at the moment.
  attr_accessor :items

  def initialize(_items)
    @items = _items
  end

  # Get the set of items to achieve total weight tw with the least costs
  # In this case p is treated as cost instead of profit
  def solve_minimum(tw, force_heuristic_solving = false)
    sort_items
    if heuristic_solving_possible || force_heuristic_solving
      solve_minimum_heuristic(0, tw)
    else
      raise "Cannot solve minimum because items do not match the required assumptions"
    end
  end

  def solve_minimum_heuristic(i, tw)
    return nil if i >= items.size
    wi = items[items.size-i-1][:w]
    ci = items[items.size-i-1][:c]
    if tw % wi == 0
      return result = ci * (tw / wi)
    else
      k = (tw / wi).floor # Maximum amount the current item fits in tw
      k.downto(0) do
        rw = tw - k * wi # Remaining weight
        rwc = solve_minimum_heuristic(i + 1, rw) # Cost to solve remaining weight with other (lighter) items
        return result = k * ci + rwc if rwc.present? # we found the costs for the remaining weight (there is a solution). This means we found a solution for the total weight as well.
      end
    end
    nil
  end

  # Sort the items on increasing weight
  def sort_items
    items.sort! { |a, b| a[:w] <=> b[:w] }
  end

  # Check if heuristic solving is possible (this is the case if the items comply with the following two assumptions):
  # - The absolute cost of heavier items are higher (or equal) than those of lighter items
  # - The relative cost (cost per weight) of heavier items are lower (or equal) than those of lighter items
  # We assume the items are already sorted
  def heuristic_solving_possible
    prev_item = nil
    items.each do |item|
      if prev_item.present?
        if item[:c] < prev_item[:c]
          # "The absolute cost of a heavier item (cost #{item[:c]} with weight #{item[:w]}) is lower than the cost of another item (cost #{prev_item[:c]} with weight #{prev_item[:w]})"
          return false
        elsif (item[:c].to_f / item[:w].to_f) > (prev_item[:c].to_f / prev_item[:w].to_f)
          # "The relative cost of a heavier item (cost #{item[:c]} with weight #{item[:w]} having a relative cost of #{item[:c].to_f/item[:w].to_f}) is higher than the cost of another item (cost #{prev_item[:c]} with weight #{prev_item[:w]} having a relative cost of #{prev_item[:c].to_f/prev_item[:w].to_f})"
          return false
        end
      end
      prev_item = item
    end
    true
  end

  # Set the cost for each item (which is the negation of the profit)
  def transform_profit_to_cost
    items.map! do |item|
      if item[:c].nil? && item[:p].present?
        item.merge(c: -item[:p])
      else
        item
      end
    end
  end

  # Test purposes
  def self.build_numbers(numbers, i = 0)
    new_numbers = numbers.dup
    numbers.each do |x|
      numbers.each do |y|
        new_numbers << x + y
      end
    end
    new_numbers = new_numbers.uniq.sort
    if i < 5
      build_numbers(new_numbers, i + 1)
    else
      new_numbers
    end
  end

# Old solving algorithms. Remove these if we are sure they are not needed anymore.

=begin
  # Minimum costs to reach total weight tw (the goal) when not using the first i items
  def min_cost_advanced(i, tw)
    cache = cache_min_cost(i, tw)
    return cache if cache.present?
    if tw == 0 # We have already reached our goal
      result = 0 # Thus the (extra) cost is zero
    elsif tw < 0 || i >= items.size # We cannot reach our goal
      result = Float::INFINITY # We simulate this with infinite cost
    else # We cannot conclude anything yet (have not reached the goal and do not know whether it is possible). Use recurrence magic to try to reach the goal.
      wi = items[i][:w] # Weight of the current item
      ci = items[i][:c] # Cost of the current item
      a = min_cost_advanced(i+1, tw) # Costs to reach the goal when not using this item at all
      b = min_cost_advanced(i, tw - wi) + ci # Costs to reach the goal when using this item atleast once
      result = [a, b].min # The minimum of the two wins (is the one to explore further)
    end
    @cache_min_cost[i][tw] = result
    result
  end

  def min_cost_simple(i, tw)
    cache = cache_min_cost(i, tw)
    return cache if cache.present?
    # Weight and cost of current item
    wi = items[i][:w]
    ci = items[i][:c]
    if tw == 0 # We want to reach a weight of zero.
      result = 0 # In order to do that, we have to do nothing, and thus have zero cost.
    elsif i == items.size - 1 # Simple case. We want to reach weight tw with only one (the last) item.
      if tw % wi == 0 # If this item's weight fits in tw, then we put it in there as much as it fits (n times0) and our costs will be n times the cost of this item's wieght
        result = ci * (tw / wi)
      else # It does not fit
        result = Float::INFINITY # We cannot make it fit with only this item. We fake the cost at infinity.
      end
    else # Difficult case, we have multiple items. Use the recurrence magic!
      attempts = []
      k = 0 # Attempt k means use the current item k times How many times are we going to use this item?
      while (tw - k*wi) >= 0 # While k times the item fits in tw
        attempts << ci*k + min_cost_simple(i+1, tw - k*wi) # Get the minimum cost when using this item k times
        k += 1
      end
      result = attempts.min # The attempt with the minimum cost wins (is the one to explore further).
    end
    @cache_min_cost[i][tw] = result
    result
  end

  def cache_min_cost(i, tw)
    @cache_min_cost ||= {}
    @cache_min_cost[i] ||= {}
    @cache_min_cost[i][tw]
  end
=end
end
