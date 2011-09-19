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
		this._record = JSON.parse('[{"t":72,"s":16},{"t":166,"s":0},{"t":201,"s":16},{"t":296,"s":0},{"t":321,"s":2},{"t":330,"s":0},{"t":335,"s":16},{"t":418,"s":0},{"t":431,"s":2},{"t":450,"s":0},{"t":458,"s":16},{"t":478,"s":0},{"t":560,"s":2},{"t":585,"s":0},{"t":597,"s":16},{"t":602,"s":0},{"t":619,"s":2},{"t":640,"s":0},{"t":674,"s":8},{"t":750,"s":0},{"t":793,"s":16},{"t":877,"s":0},{"t":886,"s":2},{"t":898,"s":0},{"t":908,"s":16},{"t":939,"s":0},{"t":1020,"s":8},{"t":1033,"s":0},{"t":1044,"s":8},{"t":1058,"s":0},{"t":1137,"s":16},{"t":1146,"s":0},{"t":1168,"s":16},{"t":1179,"s":0},{"t":1217,"s":8},{"t":1220,"s":0},{"t":1252,"s":8},{"t":1258,"s":0},{"t":1264,"s":8},{"t":1287,"s":0},{"t":1304,"s":8},{"t":1323,"s":0},{"t":1417,"s":8},{"t":1463,"s":0},{"t":1472,"s":16},{"t":1473,"s":20},{"t":1479,"s":16},{"t":1496,"s":0},{"t":1530,"s":2},{"t":1534,"s":0},{"t":1563,"s":4},{"t":1582,"s":0},{"t":1616,"s":2},{"t":1640,"s":0},{"t":1646,"s":16},{"t":1786,"s":0},{"t":1828,"s":16},{"t":1922,"s":0},{"t":1944,"s":16},{"t":1960,"s":0},{"t":1980,"s":16},{"t":1986,"s":0},{"t":2012,"s":16},{"t":2019,"s":0},{"t":2047,"s":8},{"t":2063,"s":0},{"t":2116,"s":2},{"t":2128,"s":0},{"t":2148,"s":8},{"t":2157,"s":0},{"t":2179,"s":4},{"t":2184,"s":16},{"t":2189,"s":0},{"t":2201,"s":16},{"t":2209,"s":0},{"t":2219,"s":16},{"t":2256,"s":0},{"t":2264,"s":2},{"t":2272,"s":0},{"t":2288,"s":16},{"t":2294,"s":0},{"t":2311,"s":8},{"t":2347,"s":0},{"t":2427,"s":16},{"t":2484,"s":0},{"t":2518,"s":16},{"t":2539,"s":0},{"t":2597,"s":8},{"t":2612,"s":0},{"t":2625,"s":16},{"t":2650,"s":0},{"t":2658,"s":2},{"t":2684,"s":0},{"t":2697,"s":2},{"t":2711,"s":0},{"t":2721,"s":8},{"t":2730,"s":0},{"t":2741,"s":16},{"t":2930,"s":0},{"t":2936,"s":2},{"t":2961,"s":0},{"t":2966,"s":16},{"t":3147,"s":0},{"t":3173,"s":8},{"t":3183,"s":0},{"t":3205,"s":16},{"t":3242,"s":0},{"t":3337,"s":16},{"t":3395,"s":0},{"t":3440,"s":16},{"t":3459,"s":0},{"t":3468,"s":16},{"t":3479,"s":0}]');
		this._record.reverse();
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
			//time -= 2;
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

			// Found an update state
			if( needsUpdate ) {
				this._keyStates.up = (this._currentState & KEY_STATES.UP);
				this._keyStates.down = (this._currentState & KEY_STATES.DOWN);
				this._keyStates.left = (this._currentState & KEY_STATES.LEFT);
				this._keyStates.right = (this._currentState & KEY_STATES.RIGHT);
			}
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