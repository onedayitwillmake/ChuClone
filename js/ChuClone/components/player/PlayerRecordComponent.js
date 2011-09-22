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
		this._record = [];
		this._previousPosition = new Box2D.Common.Math.b2Vec2();
		this.requiresUpdate = true;
		this.lastTime = -1;
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
		_minDistance			: 100,

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

		update: function() {
			var now = Date.now();
			if( now - this.lastTime < ChuClone.model.Constants.PLAYER.RECORDING_INTERVAL ) return;
			var body = this.attachedEntity.getBody();
			var pos = body.GetPosition();
			var delta = Box2D.Common.Math.b2Math.DistanceSquared( pos, this._previousPosition );
			if( delta < this._minDistance ) return;

			this._previousPosition = pos.Copy();
			this._record.push({t: this._clockDelegate.getCurrentTime(), x: (pos.x*PTM_RATIO) << 1, y: (pos.y*PTM_RATIO) << 1, rotation: (body.GetAngle()*57.2957795) << 1 });
			this.lastTime = now;
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