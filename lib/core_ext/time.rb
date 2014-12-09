module TimeExtensions
  %w(round floor ceil).each do |method|
    define_method "#{method}_to" do |*args|
      seconds = args.first || 60
      Time.at((to_f / seconds).send(method) * seconds)
    end
  end
end

class Time
  include TimeExtensions
  def to_tod
    TimeOfDay.new(hour, min, sec)
  end
end
