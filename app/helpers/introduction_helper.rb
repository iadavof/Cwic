module IntroductionHelper
	def intro_background_images(number)
		all = Dir.glob("app/assets/images/intro_backgrounds/*")
		all = all.map { |path| path.gsub("app/assets/images/", "") }
		all.sample(number)
	end
end
