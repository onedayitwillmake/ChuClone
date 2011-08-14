(function(){
	ChuClone.namespace("ChuClone.model");

	/**
	 * @type {ChuClone.model.AchievementTracker}
	 */
	var instance = null;
	var debugMode = false;
	ChuClone.model.AchievementTracker = function() {
		if( instance != null ) {
			console.error("AchievementTracker should never be instantiated twice! - Use getInstance()");
		}

		instance = this;
		this.reset();
	};

	ChuClone.model.AchievementTracker.prototype = {

		/**
		 * Timer for comparing jump durations
		 * @type {Date}
		 */
		_timerJump			: null,

		/**
		 * @type {Number}
		 */
		_counterTotalJumps    : 0,

		/**
		 * @type {Number}
		 */
		_counterMaxAirtime	: 0,

		/**
		 * @type {Number}
		 */
		_counterTotalAirtime: 0,

		/**
		 * @type {Number}
		 */
		_counterTotalDeaths: 0,


		/**
		 * Starts tracking a jump
		 */
		startTrackingJump: function() {
			if(this._timerJump) {
				this.log("Already tracking a jump");
				return;
			}
			this.log("Begin jump tracking");

			this._timerJump = Date.now();
			this._counterTotalJumps++;
		},

		/**
		 * Stops tracking a jump, compares results
		 */
		stopTrackingJump: function() {
			if(!this._timerJump) return; // Not tracking a jump right now

			var time = Date.now();
			var jumptime = time - this._timerJump;

			if( jumptime > this._counterMaxAirtime ) {
				this._counterMaxAirtime = jumptime;
			}

			this._counterTotalAirtime += jumptime;
			this._timerJump = null;

			this.log("AchievementTracker: Jump tracked:" + jumptime/1000 + " secs");
		},

		/**
		 * Incriments death count, called on respawn
		 */
		incrimentDeathCount: function() {
			this._counterTotalDeaths++;
		},

		/**
		 * Resets all per level stats
		 */
		reset: function() {
			this._timerJump = null;
			this._counterTotalJumps = 0;
			this._counterMaxAirtime = 0;
			this._counterTotalAirtime = 0;
			this._counterTotalDeaths = -1; // Start this one at negative one so that the first one does not count
		},

		/**
		 * Outputs to console.log if debug is turned on
		 * @param {String} message
		 */
		log: function( message ){
			if( debugMode ) {
				console.log( message );
			}
		}
	};

	/**
	 * Singleton
	 */
	ChuClone.model.AchievementTracker.getInstance = function() {
		if(instance) return instance;

		return new ChuClone.model.AchievementTracker();
	}
})();