module ExceptionNotifier
	class NotifyMyAndroidNotifier
		def initialize(options)
			@notifier_options = options.reverse_merge(default_options)
		end

		def call(exception, options={})
			env = options[:env]
			options = @notifier_options.reverse_merge(env['exception_notifier.options'] || {})
			options[:api_keys].each do |key|
				NMA.notify do |n|
					n.apikey = key
					n.priority = options[:priority]
					n.application = options[:application]
					n.event = options[:event]
					n.description = exception.class.to_s + " :: " + exception.message + ' on ' + exception.backtrace.first(3).join('  ---  ')
					end
				end
		end

		def default_options
			{
				api_key: [],
				priority: NMA::Priority::HIGH,
				application: 'Application',
				event: 'Event',
			}
		end
	end
end