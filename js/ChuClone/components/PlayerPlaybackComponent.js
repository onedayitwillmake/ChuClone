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
	
	ChuClone.namespace("ChuClone.components");

	ChuClone.components.PlayerPlaybackComponent = function() {
		ChuClone.components.PlayerPlaybackComponent.superclass.constructor.call(this);
		this.requiresUpdate = true;
		this._record = JSON.parse('[{"t":0,"s":16},{"t":0,"s":0},{"t":447,"s":16},{"t":981,"s":0},{"t":1281,"s":8},{"t":1381,"s":24},{"t":1381,"s":16},{"t":1848,"s":18},{"t":2064,"s":2},{"t":2064,"s":0},{"t":2697,"s":8},{"t":2781,"s":0},{"t":3280,"s":4},{"t":3431,"s":0},{"t":3797,"s":16},{"t":4064,"s":18},{"t":4264,"s":16},{"t":4614,"s":0},{"t":5064,"s":4},{"t":5214,"s":0},{"t":5364,"s":16},{"t":5697,"s":18},{"t":5831,"s":16},{"t":8114,"s":18},{"t":8781,"s":16},{"t":8814,"s":0},{"t":8930,"s":8},{"t":9148,"s":0},{"t":9364,"s":16},{"t":10114,"s":0},{"t":10197,"s":8},{"t":10398,"s":0},{"t":10497,"s":16},{"t":10697,"s":18},{"t":11364,"s":16},{"t":14030,"s":18},{"t":14414,"s":16},{"t":15342,"s":18},{"t":15576,"s":16},{"t":16459,"s":0},{"t":18909,"s":16},{"t":19831,"s":18},{"t":19947,"s":16},{"t":20964,"s":18},{"t":21131,"s":16},{"t":22448,"s":20},{"t":22514,"s":16},{"t":22530,"s":0},{"t":22548,"s":8},{"t":22797,"s":0},{"t":22981,"s":16},{"t":23447,"s":18},{"t":23580,"s":16},{"t":25014,"s":18},{"t":25164,"s":16},{"t":27231,"s":0},{"t":27631,"s":8},{"t":28081,"s":0},{"t":28260,"s":16},{"t":28348,"s":0},{"t":28464,"s":8},{"t":28648,"s":10},{"t":28798,"s":8},{"t":29014,"s":0},{"t":29298,"s":16},{"t":29665,"s":18},{"t":29798,"s":16},{"t":30381,"s":0},{"t":30581,"s":16},{"t":30648,"s":0},{"t":30764,"s":8},{"t":31064,"s":0},{"t":31165,"s":16},{"t":32865,"s":18},{"t":33131,"s":16},{"t":34214,"s":0},{"t":34526,"s":16},{"t":34676,"s":0},{"t":34859,"s":4},{"t":34959,"s":0},{"t":35026,"s":16},{"t":35609,"s":18},{"t":35709,"s":16},{"t":36542,"s":0},{"t":36692,"s":8},{"t":37209,"s":0},{"t":37709,"s":16},{"t":40726,"s":18},{"t":40993,"s":16},{"t":42376,"s":0},{"t":42409,"s":8},{"t":42909,"s":0},{"t":43009,"s":16},{"t":43926,"s":18},{"t":44348,"s":16},{"t":44832,"s":0},{"t":45064,"s":8},{"t":45365,"s":0},{"t":45597,"s":8},{"t":45760,"s":0},{"t":45964,"s":16},{"t":46198,"s":18},{"t":46348,"s":16},{"t":47715,"s":18},{"t":47881,"s":16},{"t":47948,"s":0},{"t":48014,"s":8},{"t":48481,"s":0},{"t":48764,"s":16},{"t":48915,"s":0},{"t":49215,"s":16},{"t":49331,"s":18},{"t":50048,"s":16},{"t":51315,"s":0},{"t":51398,"s":8},{"t":51581,"s":0},{"t":51948,"s":8},{"t":52064,"s":0},{"t":52315,"s":8},{"t":52482,"s":0},{"t":52948,"s":16},{"t":54998,"s":18},{"t":55164,"s":16},{"t":55332,"s":0},{"t":55598,"s":8},{"t":56032,"s":0},{"t":56114,"s":16},{"t":56264,"s":18},{"t":57131,"s":16},{"t":57198,"s":0},{"t":57431,"s":8},{"t":57648,"s":0},{"t":57881,"s":16},{"t":58848,"s":18},{"t":59031,"s":16},{"t":61260,"s":24},{"t":61281,"s":8},{"t":61931,"s":0},{"t":61981,"s":16},{"t":62348,"s":18},{"t":63215,"s":16},{"t":63264,"s":0},{"t":63347,"s":8},{"t":63881,"s":0},{"t":64215,"s":16},{"t":64298,"s":0},{"t":64381,"s":16},{"t":64981,"s":18},{"t":65148,"s":16},{"t":66782,"s":18},{"t":66915,"s":16},{"t":67365,"s":0},{"t":67365,"s":8},{"t":67665,"s":0},{"t":67760,"s":16},{"t":68481,"s":18},{"t":68698,"s":16},{"t":68732,"s":0},{"t":68798,"s":8},{"t":70564,"s":10},{"t":70681,"s":8},{"t":72298,"s":10},{"t":72782,"s":8},{"t":72882,"s":0},{"t":73482,"s":16},{"t":74198,"s":18},{"t":74315,"s":16},{"t":74415,"s":0},{"t":74631,"s":4},{"t":74732,"s":0},{"t":74798,"s":8},{"t":75149,"s":0},{"t":75198,"s":16},{"t":75732,"s":18},{"t":75899,"s":16},{"t":77615,"s":18},{"t":77731,"s":16},{"t":78915,"s":18},{"t":79098,"s":16},{"t":80298,"s":0},{"t":80365,"s":8},{"t":81482,"s":0},{"t":81531,"s":16},{"t":82282,"s":18},{"t":82482,"s":16},{"t":84098,"s":0},{"t":84165,"s":8},{"t":84531,"s":0},{"t":84882,"s":16},{"t":85082,"s":18},{"t":85260,"s":16},{"t":85299,"s":0},{"t":85898,"s":8},{"t":86165,"s":0},{"t":86315,"s":8},{"t":86416,"s":0},{"t":86499,"s":16},{"t":86582,"s":18},{"t":86832,"s":16},{"t":87631,"s":0},{"t":87665,"s":8},{"t":88182,"s":0},{"t":88232,"s":16},{"t":90365,"s":18},{"t":90531,"s":16},{"t":90715,"s":0},{"t":90932,"s":8},{"t":91048,"s":0},{"t":91099,"s":16},{"t":91549,"s":18},{"t":91798,"s":16},{"t":92732,"s":0},{"t":93166,"s":16},{"t":93432,"s":0},{"t":93532,"s":16},{"t":94232,"s":18},{"t":94431,"s":16}]');
		this._record.reverse();
	};

	ChuClone.components.PlayerPlaybackComponent.prototype = {
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
			ChuClone.components.PlayerPlaybackComponent.superclass.attach.call(this, anEntity);
		},

        execute: function() {
            ChuClone.components.PlayerPlaybackComponent.superclass.execute.call(this);
			if( !this._clockDelegate ) {
				console.error("Cannot attach PlayerPlaybackComponent without valid clock delegate");
				return;
			}

			/**
			 * @type {ChuClone.components.KeyboardInputComponent}
			 */
			this._keyboardComponent = this.attachedEntity.getComponentWithName( ChuClone.components.KeyboardInputComponent.prototype.displayName );
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
			var len = this._record.length;
			var needsUpdate = false;
			var i = 0;
			while( i < len) {
				var stateInfo = this._record[i];
				// Match found - set our state and pop the element
				if(stateInfo.t <= time) {
					this._currentState = stateInfo.s;
					this._record.pop();
					needsUpdate = true;
					break;
				}

				// If this one is higher than our timestamp, then any ones after are as well - exit the loop
//				if( stateInfo.t > time ) {
//					break;
//				}
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
           ChuClone.components.PlayerPlaybackComponent.superclass.detach.call(this);
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

    ChuClone.extend( ChuClone.components.PlayerPlaybackComponent, ChuClone.components.BaseComponent );
})();