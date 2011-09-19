/**
File:
	PlayerPlaybackComponent.js
Created By:
	Mario Gonzalez
Project	:
	RealtimeMultiplayerNodeJS
Abstract:
 	Records a players keyboard state to enable playback of a level
 Basic Usage:

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/

*/
(function(){
    "use strict";

	/**
	 * Stores current status of each key
	 * @type {Object}
	 */
	var KEY_STATES = {
		UP		: 1 << 1,
		DOWN	: 1 << 2,
		LEFT	: 1 << 3,
		RIGHT	: 1 << 4
	};
	
	ChuClone.namespace("ChuClone.components.player");

	ChuClone.components.player.PlayerPlaybackComponent = function() {
		ChuClone.components.player.PlayerPlaybackComponent.superclass.constructor.call(this);
		this._keyStates = {left:false, right:false, up:false, down: false};
		this.requiresUpdate = true;
		this._record = JSON.parse('[{"t":39,"s":16},{"t":403,"s":0},{"t":415,"s":16},{"t":499,"s":0},{"t":506,"s":2},{"t":526,"s":0},{"t":542,"s":16},{"t":635,"s":0},{"t":645,"s":8},{"t":713,"s":0},{"t":740,"s":16},{"t":783,"s":0},{"t":820,"s":8},{"t":836,"s":0},{"t":887,"s":16},{"t":907,"s":0},{"t":913,"s":8},{"t":940,"s":0},{"t":968,"s":16},{"t":1020,"s":0},{"t":1027,"s":8},{"t":1072,"s":0},{"t":1080,"s":16},{"t":1137,"s":0},{"t":1145,"s":8},{"t":1163,"s":0},{"t":1187,"s":16},{"t":1297,"s":0},{"t":1318,"s":8},{"t":1330,"s":0},{"t":1343,"s":16},{"t":1356,"s":0},{"t":1392,"s":8},{"t":1423,"s":0},{"t":1434,"s":16},{"t":1483,"s":18},{"t":1489,"s":16},{"t":1495,"s":0},{"t":1548,"s":8},{"t":1557,"s":0},{"t":1571,"s":16},{"t":1655,"s":18},{"t":1662,"s":16},{"t":1852,"s":18},{"t":1857,"s":16},{"t":1943,"s":18},{"t":1947,"s":16},{"t":1979,"s":0},{"t":2017,"s":16},{"t":2042,"s":18},{"t":2048,"s":16},{"t":2131,"s":18},{"t":2139,"s":16},{"t":2154,"s":0},{"t":2179,"s":16},{"t":2192,"s":0},{"t":2199,"s":16},{"t":2204,"s":0},{"t":2223,"s":16},{"t":2226,"s":0},{"t":2232,"s":16},{"t":2316,"s":0},{"t":2339,"s":16},{"t":2549,"s":0},{"t":2571,"s":8},{"t":2577,"s":0},{"t":2586,"s":16},{"t":2615,"s":18},{"t":2619,"s":16},{"t":2706,"s":18},{"t":2710,"s":16},{"t":2742,"s":18},{"t":2767,"s":16},{"t":2879,"s":20},{"t":2886,"s":16},{"t":2906,"s":18},{"t":2913,"s":16},{"t":3013,"s":18},{"t":3020,"s":16},{"t":3038,"s":0},{"t":3044,"s":8},{"t":3120,"s":0},{"t":3146,"s":8},{"t":3183,"s":0},{"t":3195,"s":16},{"t":3221,"s":18},{"t":3229,"s":16},{"t":3244,"s":0},{"t":3271,"s":8},{"t":3276,"s":0},{"t":3302,"s":16},{"t":3310,"s":18},{"t":3317,"s":16},{"t":3319,"s":0},{"t":3333,"s":8},{"t":3371,"s":0},{"t":3373,"s":16},{"t":3459,"s":18},{"t":3472,"s":16},{"t":3493,"s":0},{"t":3515,"s":16},{"t":3577,"s":18},{"t":3586,"s":16},{"t":3684,"s":18},{"t":3691,"s":16},{"t":3774,"s":0},{"t":3779,"s":8},{"t":3815,"s":0},{"t":3822,"s":16},{"t":3939,"s":0},{"t":3955,"s":8},{"t":3981,"s":0},{"t":4018,"s":16},{"t":4142,"s":18},{"t":4146,"s":16},{"t":4300,"s":18},{"t":4320,"s":16},{"t":4356,"s":18},{"t":4369,"s":16},{"t":4402,"s":18},{"t":4410,"s":16}]');
		//this._record.reverse();
	};

	ChuClone.components.player.PlayerPlaybackComponent.prototype = {
        /**
         * @type {String}
         */
		displayName						: "PlayerPlaybackComponent",					// Unique string name for this Trait

        /**
         * @type {ChuClone.GameEntity}
         */
        _player					: null,

		/**
		 * Must have a valid method 'getCurrentTime'
		 * @type {Object}
		 */
		_clockDelegate			: null,

		/**
		 * @type {Array}
		 */
		_record	    : null,

		/**
		 * Bitmask of the current keyboard state
		 * @type {Number}
		 */
		_currentState: 0,

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.player.PlayerPlaybackComponent.superclass.attach.call(this, anEntity);
		},

        execute: function() {
            ChuClone.components.player.PlayerPlaybackComponent.superclass.execute.call(this);
			if( !this._clockDelegate ) {
				console.error("Cannot attach PlayerPlaybackComponent without valid clock delegate");
				return;
			}

			/**
			 * @type {ChuClone.components.player.CharacterControllerComponent}
			 */
			this._keyboardComponent = this.attachedEntity.getComponentWithName( ChuClone.components.player.CharacterControllerComponent.prototype.displayName );
			this._keyboardComponent._input = this;
			if( !this._keyboardComponent ) {
				console.error("Cannot attach PlayerInputComponent. Cannot find 'PlayerPlaybackComponent' in attachedEntity");
				return;
			}
        },

		/**
		 * Overrides the keyboardComponents state
		 */
		update: function() {
			var time = this._clockDelegate.getCurrentTime();
			//console.log(time)
			time -= 5;
			var len = this._record.length;
			var needsUpdate = false;
			var i = 0;
			while( i < len) {
				var stateInfo = this._record[i];
				// Match found - set our state and pop the element
				if(stateInfo.t == time) {
					this._currentState = stateInfo.s;
					//this._record.pop();
					needsUpdate = true;
					break;
				}
				i++;
			}

			//console.log(this._currentState & KEY_STATES.UP)
			//console.log(this._currentState & KEY_STATES.DOWN)
			//console.log(this._currentState & KEY_STATES.LEFT)
			//console.log(this._currentState & KEY_STATES.RIGHT)

			// Found an update state
			//if( needsUpdate ) {
				this._keyStates.up = (this._currentState & KEY_STATES.UP) != 0;
				this._keyStates.down = (this._currentState & KEY_STATES.DOWN) != 0;
				this._keyStates.left = (this._currentState & KEY_STATES.LEFT) != 0;
				this._keyStates.right = (this._currentState & KEY_STATES.RIGHT) != 0;

			//console.log(this._keyStates.left, this._currentState & KEY_STATES.LEFT)
			//}
		},

        /**
         * Restore material and restitution
         */
        detach: function() {
           ChuClone.components.player.PlayerPlaybackComponent.superclass.detach.call(this);
        },

		/**
		 * Sets the object we call getClock on, probably the playlevelstate
		 * @param {ChuClone.states.PlayLevelState} aDelegate
		 */
		setClockDelegate: function( aDelegate ) {
		   if( typeof aDelegate.getCurrentTime === 'function' ) {
			   this._clockDelegate = aDelegate;
		   }
		},

		/**
		 * @return {Array}
		 */
		getRecord: function() { return this._record }
	};

    ChuClone.extend( ChuClone.components.player.PlayerPlaybackComponent, ChuClone.components.BaseComponent );
})();