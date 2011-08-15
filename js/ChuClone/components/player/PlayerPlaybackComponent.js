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
		this.requiresUpdate = true;
		this._record = JSON.parse('[{"t":107,"s":16},{"t":199,"s":18},{"t":206,"s":16},{"t":265,"s":18},{"t":297,"s":16},{"t":338,"s":18},{"t":346,"s":16},{"t":406,"s":18},{"t":430,"s":16},{"t":476,"s":0},{"t":485,"s":8},{"t":503,"s":10},{"t":514,"s":2},{"t":519,"s":18},{"t":520,"s":16},{"t":598,"s":0},{"t":610,"s":8},{"t":613,"s":10},{"t":631,"s":8},{"t":633,"s":0},{"t":650,"s":16},{"t":686,"s":0},{"t":703,"s":16},{"t":715,"s":18},{"t":722,"s":16},{"t":798,"s":0},{"t":805,"s":8},{"t":828,"s":0},{"t":835,"s":16},{"t":998,"s":0},{"t":1003,"s":2},{"t":1012,"s":0},{"t":1022,"s":8},{"t":1050,"s":10},{"t":1059,"s":2},{"t":1062,"s":0},{"t":1064,"s":8},{"t":1072,"s":0},{"t":1083,"s":16},{"t":1095,"s":0},{"t":1105,"s":8},{"t":1117,"s":10},{"t":1129,"s":8},{"t":1131,"s":0},{"t":1149,"s":16},{"t":1151,"s":0},{"t":1172,"s":16},{"t":1217,"s":18},{"t":1224,"s":16},{"t":1265,"s":20},{"t":1283,"s":16},{"t":1320,"s":18},{"t":1327,"s":16},{"t":1357,"s":20},{"t":1371,"s":16},{"t":1452,"s":0},{"t":1462,"s":16},{"t":1486,"s":18},{"t":1522,"s":16},{"t":1594,"s":18},{"t":1599,"s":16},{"t":1602,"s":0},{"t":1611,"s":4},{"t":1617,"s":12},{"t":1621,"s":8},{"t":1624,"s":0},{"t":1632,"s":8},{"t":1642,"s":10},{"t":1727,"s":2},{"t":1729,"s":0},{"t":1729,"s":16},{"t":1734,"s":20},{"t":1760,"s":16},{"t":1836,"s":18},{"t":1844,"s":16},{"t":1913,"s":18},{"t":2080,"s":2},{"t":2084,"s":0},{"t":2085,"s":8},{"t":2098,"s":10},{"t":2109,"s":8},{"t":2114,"s":0},{"t":2123,"s":16},{"t":2129,"s":20},{"t":2138,"s":16},{"t":2160,"s":18},{"t":2257,"s":16},{"t":2263,"s":20},{"t":2265,"s":4},{"t":2273,"s":20},{"t":2283,"s":16},{"t":2324,"s":18},{"t":2424,"s":16},{"t":2426,"s":0},{"t":2432,"s":8},{"t":2454,"s":0},{"t":2463,"s":16},{"t":2479,"s":0},{"t":2484,"s":8},{"t":2488,"s":0},{"t":2505,"s":16},{"t":2524,"s":0},{"t":2527,"s":8},{"t":2534,"s":10},{"t":2553,"s":8},{"t":2571,"s":0},{"t":2586,"s":16},{"t":2591,"s":0},{"t":2619,"s":16},{"t":2633,"s":0},{"t":2646,"s":16},{"t":2660,"s":0},{"t":2667,"s":16},{"t":2755,"s":20},{"t":2763,"s":16},{"t":2790,"s":18},{"t":2796,"s":16},{"t":2832,"s":20},{"t":2846,"s":16},{"t":2931,"s":0},{"t":2952,"s":16},{"t":2965,"s":18},{"t":2974,"s":16},{"t":3072,"s":0},{"t":3112,"s":16},{"t":3136,"s":0},{"t":3141,"s":8},{"t":3152,"s":10},{"t":3167,"s":8},{"t":3178,"s":0},{"t":3198,"s":16},{"t":3268,"s":18},{"t":3332,"s":16},{"t":3337,"s":20},{"t":3348,"s":16},{"t":3386,"s":18},{"t":3392,"s":16},{"t":3432,"s":18},{"t":3438,"s":16},{"t":3444,"s":18},{"t":3449,"s":16},{"t":3455,"s":18},{"t":3460,"s":16},{"t":3558,"s":0},{"t":3569,"s":8},{"t":3583,"s":0},{"t":3596,"s":8},{"t":3605,"s":0},{"t":3614,"s":16},{"t":3620,"s":18},{"t":3632,"s":16},{"t":3678,"s":0},{"t":3689,"s":8},{"t":3694,"s":0},{"t":3699,"s":16},{"t":3707,"s":18},{"t":3719,"s":16},{"t":3794,"s":0}]');
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
			 * @type {ChuClone.components.player.KeyboardInputComponent }
			 */
			this._keyboardComponent = this.attachedEntity.getComponentWithName( ChuClone.components.player.KeyboardInputComponent .prototype.displayName );
			if( !this._keyboardComponent ) {
				console.error("Cannot attach PlayerInputComponent. Cannot find 'PlayerPlaybackComponent' in attachedEntity");
				return;
			}
			this._keyboardComponent.handleKeyDown = this._keyboardComponent.handleKeyUp = function(){};
        },

		/**
		 * Overrides the keyboardComponents state
		 */
		update: function() {
			var time = this._clockDelegate.getCurrentTime();
			time += 4;
			var len = this._record.length;
			var needsUpdate = false;
			var i = 0;
			while( i < len) {
				var stateInfo = this._record[i];
				// Match found - set our state and pop the element
				if(stateInfo.t == time) {
					this._currentState = stateInfo.s;
					this._record.pop();
					needsUpdate = true;
					break;
				}
				i++;
			}

			// Found an update state
			if( needsUpdate ) {
				this._keyboardComponent._keyStates.up = (this._currentState & KEY_STATES.UP);
				this._keyboardComponent._keyStates.down = (this._currentState & KEY_STATES.DOWN);
				this._keyboardComponent._keyStates.left = (this._currentState & KEY_STATES.LEFT);
				this._keyboardComponent._keyStates.right = (this._currentState & KEY_STATES.RIGHT);
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