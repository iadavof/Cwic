module TimeExtensions
  %w[ round floor ceil ].each do |_method|
    define_method "#{_method}_to" do |*args|
      seconds = args.first || 60
      Time.at((self.to_f / seconds).send(_method) * seconds)
    end
  end
end

class Time
  include TimeExtensions
  def to_tod
    TimeOfDay.new(self.hour, self.min, self.sec)
  end
end
