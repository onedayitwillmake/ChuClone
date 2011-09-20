(function(){
	ChuClone.namespace("ChuClone.model");

	/**
	 * @type {ChuClone.model.AnalyticsTracker}
	 */
	var instance = null;
	var debugMode = false;
	ChuClone.model.AnalyticsTracker = function() {
		if( instance != null ) {
			console.error("AnalyticsTracker should never be instantiated twice! - Use getInstance()");
		}
		instance = this;
	};

	ChuClone.model.AnalyticsTracker.prototype = {
		trackLevelLoaded: function( levelTitle ) {
			if(window._gaq)
				window._gaq.push(['_trackEvent', 'Levels', 'Play', levelTitle]);
		},

		trackLevelCompleted: function( levelTitle ){
			window._gaq.push(['_trackEvent', 'Levels', 'Complete', levelTitle]);
		},

		trackLevelDeath: function(){
			var currentState = ChuClone.model.FSM.StateMachine.getInstance().getCurrentState();
			if( !currentState.hasOwnProperty('_elapsedTime') ) return;
			if( currentState._elapsedTime < 100 ) return; //
			window._gaq.push(['_trackEvent', 'Levels', 'Death', ChuClone.editor.LevelManager.INSTANCE._levelModel.levelName, currentState._elapsedTime]);
		},

		trackInstructions: function( state ) {
			window._gaq.push(['_trackEvent', 'Instructions', state ]);
		},

		trackFullscreen: function( state ) {
			window._gaq.push(['_trackEvent', 'Fullscreen', state ]);
		},

		trackHD: function( state ) {
			window._gaq.push(['_trackEvent', 'HD', state ]);
		},

		trackGlowMode: function() {
			window._gaq.push(['_trackEvent', 'GlowMode', 'TRUE']);
		}


	};

	/**
	 * Singleton
	 */
	ChuClone.model.AnalyticsTracker.getInstance = function() {
		if(instance) return instance;

		return new ChuClone.model.AnalyticsTracker();
	}
})();