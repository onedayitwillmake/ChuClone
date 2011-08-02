/**
File:
	ChaseTrait.js
Created By:
	Mario Gonzalez
Project	:
	RealtimeMultiplayerNodeJS
Abstract:
 	This trait will cause an entity to chase a target
 Basic Usage:

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/

*/
(function(){
    "use strict";
    if( !ChuClone.model.Constants.JOYSTICK.ENABLED ) {
        console.warn("RemoteJoystickInputComponent - Joystick ChuClone.model.Constants.JOYSTICK.ENABLED == false. Aborting...");
        return;
    }

    document.write('<script src="/game/js/lib/NoBarrierOSC/socket.io.js"></script>');
    document.write('<script src="/game/js/lib/NoBarrierOSC/SortedLookupTable.js"></script>');
    document.write('<script src="/game/js/lib/NoBarrierOSC/RealtimeMutliplayerGame.js"></script>');
    document.write('<script src="/game/js/lib/NoBarrierOSC/Point.js"></script>');
    document.write('<script src="/game/js/lib/NoBarrierOSC/Constants.js"></script>');
    document.write('<script src="/game/js/lib/NoBarrierOSC/NetChannelMessage.js"></script>');
    document.write('<script src="/game/js/lib/NoBarrierOSC/ClientNetChannel.js"></script>');
    document.write('<script src="/game/js/lib/NoBarrierOSC/GameEntity.js"></script>');
    document.write('<script src="/game/js/lib/NoBarrierOSC/ClientApp.js"></script>');

	ChuClone.namespace("ChuClone.components");
	ChuClone.components.RemoteJoystickInputComponent = function() {
		ChuClone.components.RemoteJoystickInputComponent.superclass.constructor.call(this);
        this.netChannel = new RealtimeMultiplayerGame.ClientNetChannel( this, ChuClone.model.Constants.JOYSTICK.SERVER_LOCATION, ChuClone.model.Constants.JOYSTICK.SERVER_PORT );

        var that = this;
            (function loop() {
                that.update();
                window.requestAnimationFrame( loop, null );
            })();
	};

	ChuClone.components.RemoteJoystickInputComponent.prototype = {
        /**
         * @type {String}
         */
		displayName						: "RemoteJoystickInputComponent",					// Unique string name for this Trait

        gameClockReal  			: 0,											// Actual time via "new Date().getTime();"
		gameClock				: 0,											// Seconds since start
		gameTick				: 0,											// Ticks/frames since start

        _clientId               : -1,

        /**
         * @type {Function}
         */
        _callback                       :null,

        /**
         * Stores current status of each key
         * @type {Object}
         */
        _keyStates                      : {
            left: false,
            right: false,
            up: false,
            down: false,
            angle: 0,
        },

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.RemoteJoystickInputComponent.superclass.attach.call(this, anEntity);
		},

        execute: function() {
            ChuClone.components.RemoteJoystickInputComponent.superclass.execute.call(this);
        },

        /**
         * Restore material and restitution
         */
        detach: function() {
           ChuClone.components.RemoteJoystickInputComponent.superclass.detach.call(this);
        },

        ///// NETCHANNEL DELEGATE
        netChannelDidConnect: function() {
            this.netChannel.addMessageToQueue( true, RealtimeMultiplayerGame.Constants.CMDS.PLAYER_JOINED, {type: "cabinet" } );
		},

		netChannelDidReceiveMessage: function( aMessage ) {
			this.log("RecievedMessage", aMessage);
		},
		netChannelDidDisconnect: function() {
			this.log("netChannelDidDisconnect", arguments);
		},

        update: function() {
			this.updateClock();
			this.netChannel.tick();
		},

		/**
		 * Updates the gameclock and sets the current
		 */
		updateClock: function() {
			//
			// Store previous time and update current
			var oldTime = this.gameClockReal;
			this.gameClockReal = new Date().getTime();

			// Our clock is zero based, so if for example it says 10,000 - that means the game started 10 seconds ago
			var delta = this.gameClockReal - oldTime;
			this.gameClock += delta;
			this.gameTick++;

			// Framerate Independent Motion -
			// 1.0 means running at exactly the correct speed, 0.5 means half-framerate. (otherwise faster machines which can update themselves more accurately will have an advantage)
			this.speedFactor = delta / ( 1000/this.targetFramerate );
			if (this.speedFactor <= 0) this.speedFactor = 1;
		},

		/**
		 * Called by the ClientNetChannel, it sends us an array containing tightly packed values and expects us to return a meaningful object
		 * It is left up to each game to implement this function because only the game knows what it needs to send.
		 * However the 4 example projects in RealtimeMultiplayerNodeJS offer should be used ans examples
		 *
		 * @param {Array} entityDescAsArray An array of tightly packed values
		 * @return {Object} An object which will be returned to you later on tied to a specific entity
		 */
		parseEntityDescriptionArray: function(entityDescAsArray) {
			var entityDescription = {};

			// It is left upto each game to implement this function because only the game knows what it needs to send.
			// However the 4 example projects in RealtimeMultiplayerNodeJS offer this an example
			entityDescription.entityid = +entityDescAsArray[0];
			entityDescription.clientid = +entityDescAsArray[1];
			entityDescription.entityType = entityDescAsArray[2];

            
//            console.log("entityDescription.clientid", entityDescription.clientid)
            this._keyStates.up = +entityDescAsArray[3];
            this._keyStates.down = +entityDescAsArray[4];
            this._keyStates.left = +entityDescAsArray[5];
            this._keyStates.right = +entityDescAsArray[6];

			return entityDescription;
		},

		getGameClock: function() {
		   return this.gameClock;
		},

        log: function() { console.log.apply(console, arguments); }

	};

    ChuClone.extend( ChuClone.components.RemoteJoystickInputComponent, ChuClone.components.BaseComponent );
})();