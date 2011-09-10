(function() {
	"use strict";
	ChuClone.namespace("ChuClone.controller");
	ChuClone.controller.AudioController = function() {
		this._sounds = {};
		this._closures = {};
		this.setupEvents();
	};

	ChuClone.controller.AudioController.prototype = {
		/**
		 * @type {Boolean}
		 */
		_isMuted	: false,

		/**
		 * @type {Object}
		 */
		_sounds		: null,

		/**
		 * @type {Object}
		 */
		_closures	: null,

		EVENTS: {
            SHOULD_PLAY_SOUND	: "ChuClone.controller.AudioController.ShouldPlaySound",
			SHOULD_TOGGLE_MUTE	: "ChuClone.controller.AudioController.ToggleMute",
			ALL_SOUNDS_LOADED	: "ChuClone.controller.AudioController.AllSoundsLoaded"
        },


		/**
		 * Sets up events
		 */
		setupEvents: function() {
			var that = this;
			this._closures['onShouldPlaySound'] = function( e ) { that.onShouldPlaySound(e); };
			this._closures['onShouldToggleMute'] = function( e ) { that.onShouldToggleMute(e); };
			ChuClone.Events.Dispatcher.addListener( ChuClone.controller.AudioController.prototype.EVENTS.SHOULD_PLAY_SOUND, this._closures['onShouldPlaySound']);
		},

		/**
		 * Loads the sound files specified
		 * @param {Object} soundDictionary
		 */
		preloadSounds: function( soundDictionary ) {

			var that = this;
			var totalSounds = 0;
			var soundsLoaded = 0;
			var audioArray = [];

			// create a new Audio for each sound
			for( var prop in soundDictionary ) {
				if( !soundDictionary.hasOwnProperty(prop) ) return;


				totalSounds++;
				var id = soundDictionary[prop].id;
				var src = soundDictionary[prop].src;
				var audio = this.addSound( id, src );
				audioArray.push( audio );
			}

			// Preload the sounds now that we know how many there are
			for(var i = 0; i < audioArray.length; ++i) {
				audioArray[i].onload = function(){
					if( ++soundsLoaded === totalSounds ) {
						console.log("AudioController - All sounds loaded.");
						ChuClone.Events.Dispatcher.emit( ChuClone.controller.AudioController.EVENTS.ALL_SOUNDS_LOADED, that);
					}
				};
			}
		},

		/**
		 * Adds a sound to the AudioController
		 * @param {String} aName
		 * @param {String} source
		 * @return {Audio}
		 */
		addSound	: function( aName, source ) {
			if( this._sounds.hasOwnProperty( aName ) ) {
				if( this._sounds[aName].src != source ) {
					console.warn("Overwriting sound! - ", aName);
				} else {   // Sound already added
					return;
				}
			}

			var audio = new Audio();
			audio.src = ChuClone.model.Constants.SERVER.ASSET_PREFIX + source;
			audio.preload = true;
			audio.loop = false;
			this._sounds[aName] = audio;

			return audio;
		},

		/**
		 * Attempts to play a sound.
		 * This should not be called directly, use the dispatcher and send the sound-id as the second argument
		 * Check the constants file for the inital sound mapping
		 * @param {String} soundName
		 */
		onShouldPlaySound: function( soundName ) {

			// Muted or don't have such a sound
			if( this._isMuted ) return;
			if( !this._sounds.hasOwnProperty(soundName) ) {
				console.log("AudioController: No such sound '", soundName ,"'");
				return;
			}

			var audio = new Audio();
			audio.volume = 0.25;
			audio.src = this._sounds[soundName].src;
			audio.play();
		},


		/**
		 * Toggles the current state of _isMuted
		 * @param {Boolean} value If passed we will be set to that value. If not passed, we will be set to !_isMuted
		 */
		onShouldToggleMute: function( value ) {
			this._isMuted = value || !this._isMuted;

			// Stop all sounds
			if(this._isMuted) {
				for (var soundid in this._sounds) {
					if (!this._sounds.hasOwnProperty(soundid)) return;

					var audio = this._sounds[soundid];

					// If duration isNaN then its not loaded
					if(isNaN(audio.duration)) return;

					audio.currentTime = 0;
				 	audio.pause();
				}
			} else {
				// Play a sound to let them know audio is enabled
				//this.playSound(this.config.SOUNDS_MAP.acquiredPowerup);
			}
		},

		/**
		 * Deallocates resources
		 */
		dealloc: function() {
			ChuClone.Events.Dispatcher.removeListener( ChuClone.controller.AudioController.EVENTS.SHOULD_PLAY_SOUND, this._closures['onShouldPlaySound']);
			ChuClone.Events.Dispatcher.removeListener( ChuClone.controller.AudioController.EVENTS.SHOULD_TOGGLE_MUTE, this._closures['onShouldToggleMute']);
			this._closures['onShouldPlaySound'] = null;
			this._sounds = null;
		}
	}
})();