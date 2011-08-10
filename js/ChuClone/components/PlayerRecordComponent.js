/**
File:
	PlayerRecordComponent.js
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

	ChuClone.components.PlayerRecordComponent = function() {
		ChuClone.components.PlayerRecordComponent.superclass.constructor.call(this);
		this._record = [];
	};

	ChuClone.components.PlayerRecordComponent.prototype = {
        /**
         * @type {String}
         */
		displayName						: "PlayerRecordComponent",					// Unique string name for this Trait

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
		 * @type {Function}
		 */
		_callback				: null,

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
			ChuClone.components.PlayerRecordComponent.superclass.attach.call(this, anEntity);
		},

        execute: function() {
            ChuClone.components.PlayerRecordComponent.superclass.execute.call(this);
			if( !this._clockDelegate ) {
				console.error("Cannot attach PlayerRecordComponent without valid clock delegate");
				return;
			}

			var PlayerRecordComponent = this.attachedEntity.getComponentWithName( ChuClone.components.PlayerRecordComponent.prototype.displayName );
			if( !PlayerRecordComponent ) {
				console.error("Cannot attach PlayerInputComponent. Cannot find 'PlayerRecordComponent' in attachedEntity");
				return;
			}


			var that = this;
            this._callback = function(e){
                if(e.type == "keyup") that.handleKeyUp(e);
                else if( e.type === "keydown") that.handleKeyDown(e);
            };

            ChuClone.DOM_ELEMENT.addEventListener('keydown', this._callback, false);
            ChuClone.DOM_ELEMENT.addEventListener('keyup', this._callback, false);

        },

		/**
		 * Dispatched when a key is press down, changes the state this component
		 * @param {Event} e
		 */
        handleKeyDown: function( e ) {
			var state = this._currentState;
			var validChange = false;

            if( e.keyCode == ChuClone.model.Constants.KEYS.A ) { state |= KEY_STATES.LEFT; validChange = true; }
            else if(  e.keyCode == ChuClone.model.Constants.KEYS.D ) { state |= KEY_STATES.RIGHT; validChange = true; }
            if( e.keyCode == ChuClone.model.Constants.KEYS.W ) { state |= KEY_STATES.UP; validChange = true; }
            else if( e.keyCode == ChuClone.model.Constants.KEYS.S ) { state |= KEY_STATES.DOWN; validChange = true; }

			if( validChange && state !== this._currentState ) {
				this.onStateHasChanged( state );
			}
        },

		/**
		 * Dispatched when a key is press down, changes the state this component
		 * @param {Event} e
		 */
        handleKeyUp: function(e) {
			var state = this._currentState;
			var validChange = false;

            if( e.keyCode == ChuClone.model.Constants.KEYS.A ) { state &= ~KEY_STATES.LEFT; validChange = true; }
            else if(  e.keyCode == ChuClone.model.Constants.KEYS.D ) { state &= ~KEY_STATES.RIGHT; validChange = true; }
            if( e.keyCode == ChuClone.model.Constants.KEYS.W ) { state &= ~KEY_STATES.UP; validChange = true; }
            else if( e.keyCode == ChuClone.model.Constants.KEYS.S ) { state &= ~KEY_STATES.DOWN; validChange = true; }

			if( validChange && state !== this._currentState ) {
				this.onStateHasChanged( state );
			}
        },

		/**
		 * The state has changed, set the current state and record the previous
		 * @param newState
		 */
		onStateHasChanged: function( newState ) {
			this._currentState = newState;
			var time = this._clockDelegate.getCurrentTime();
			this._record.push({t:time, s: this._currentState });
		},

        /**
         * Restore material and restitution
         */
        detach: function() {
            ChuClone.DOM_ELEMENT.removeEventListener('keydown', this._callback, false);
            ChuClone.DOM_ELEMENT.removeEventListener('keyup', this._callback, false);
            this._callback = null;

           ChuClone.components.PlayerRecordComponent.superclass.detach.call(this);
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

    ChuClone.extend( ChuClone.components.PlayerRecordComponent, ChuClone.components.BaseComponent );
})();