class Level < ActiveRecord::Base
	def self.createFromJSON( levelJSON )
		@newInstance = Level.new(:title => levelJSON['editingInfo']['levelName'], 'times_played' => 0, 'times_completed' => 0, 'json' => levelJSON.to_json)
		if not @newInstance.save
			raise Exception.new("Could not create level entry!")
		end
		
		@newInstance.title
	end
end
