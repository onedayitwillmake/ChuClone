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


	ChuClone.namespace("ChuClone.components.player");
	var PTM_RATIO = ChuClone.model.Constants.PTM_RATIO;
	ChuClone.components.player.PlayerRecordComponent = function() {
		ChuClone.components.player.PlayerRecordComponent.superclass.constructor.call(this);
		this.reset();
	};

	ChuClone.components.player.PlayerRecordComponent.prototype = {
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
		 * @type {Box2D.Common.Math.b2Vec2}
		 */
		_previousPosition		: null,

		/**
		 * @type {Number}
		 */
		_minDistance			: 1/PTM_RATIO,

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
			ChuClone.components.player.PlayerRecordComponent.superclass.attach.call(this, anEntity);
		},

        execute: function() {
            ChuClone.components.player.PlayerRecordComponent.superclass.execute.call(this);
			if( !this._clockDelegate ) {
				console.error("Cannot attach PlayerRecordComponent without valid clock delegate");
				return;
			}

			var PlayerRecordComponent = this.attachedEntity.getComponentWithName( ChuClone.components.player.PlayerRecordComponent.prototype.displayName );
			if( !PlayerRecordComponent ) {
				console.error("Cannot execute PlayerInputComponent. Cannot find 'PlayerRecordComponent' in attachedEntity");
				return;
			}
        },

		/**
		 * Records player position info if
		 */
		update: function() {
			var now = Date.now();
			if( now - this.lastTime < ChuClone.model.Constants.PLAYER.RECORDING_INTERVAL ) return;
			var body = this.attachedEntity.getBody();
			var pos = body.GetPosition();
			var delta = Box2D.Common.Math.b2Math.DistanceSquared( pos, this._previousPosition );

			//console.log("Attempting to record TimeDelta:", now - this.lastTime);
			if( delta < this._minDistance ) return;

			//console.log("Recorded Position: delta:", delta);
			this.addRecord();
		},

		addRecord: function() {
			//console.log("addingrecord");
			var body = this.attachedEntity.getBody();
			var pos = body.GetPosition();
			this._previousPosition.x = pos.x;
			this._previousPosition.y = pos.y;
			this._record.push({t: this._clockDelegate.getCurrentTime(), x: Math.round(pos.x*1000)/1000, y: Math.round(pos.y*1000)/1000, r: Math.round(body.GetAngle()*10000)/10000  });
			this.lastTime = Date.now();
		},

		/**
		 * Clears record
		 */
		reset: function() {
			this._record = [];
			this._previousPosition = new Box2D.Common.Math.b2Vec2();
			this.requiresUpdate = true;
			this.lastTime = -1;
		},

        /**
         * Restore material and restitution
         */
        detach: function() {
           ChuClone.components.player.PlayerRecordComponent.superclass.detach.call(this);
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
		getRecord: function() {
			console.log( JSON.stringify( this._record ) );
			return this._record;
		}
	};

    ChuClone.extend( ChuClone.components.player.PlayerRecordComponent, ChuClone.components.BaseComponent );
})();