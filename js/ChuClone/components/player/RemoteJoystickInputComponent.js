/**
 File:
 	RemoteJoystickInputComponent
 Created By:
 	Mario Gonzalez
 Project	:
 	ChuClone
 Abstract:
 	This trait is used for the kiosk mode in ChuClone, it hooks into a NoBarrierOSC server
 	and controls the player.
 	Because everything is done via remote input, this component is a bit pervasive in how it interacts with the rest of the game.

 Basic Usage:

 License:
 	Creative Commons Attribution-NonCommercial-ShareAlike
 	http://creativecommons.org/licenses/by-nc-sa/3.0/

 */
(function() {
	"use strict";
	if (!ChuClone.model.Constants.JOYSTICK.ENABLED) {
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

	ChuClone.namespace("ChuClone.components");

	ChuClone.components.player.RemoteJoystickInputComponent = function() {
		ChuClone.components.player.RemoteJoystickInputComponent.superclass.constructor.call(this);
		this.requiresUpdate = true;
        this.forceLoadedLevel = -1;

		this.cmdMap[RealtimeMultiplayerGame.Constants.CMDS.JOYSTICK_UPDATE] = this.joystickUpdate;
		this.cmdMap[RealtimeMultiplayerGame.Constants.CMDS.JOYSTICK_SELECT_LEVEL] = this.joystickSelectLevel;

		var address = ChuClone.model.Constants.JOYSTICK.SERVER_LOCATION;
		var port = ChuClone.model.Constants.JOYSTICK.SERVER_PORT;
		var transports = ['websocket', 'xhr-polling'];

		this.netChannel = new RealtimeMultiplayerGame.ClientNetChannel(this, address, port, transports, true);
	};


	ChuClone.components.player.RemoteJoystickInputComponent.prototype = {
		/**
		 * @type {String}
		 */
		displayName			: "RemoteJoystickInputComponent",				// Unique string name for this Trait

		/**
		 * Actual time via Date.now()
		 * @type {Number}
		 */
		gameClockReal		: 0,

		/**
		 * Time since game start
		 * @{type} Number
		 */
		gameClock			: 0,

		/**
		 * Frames since game start
		 * @{type} Number
		 */
		gameTick			: 0,


		/**
		 * @type {ChuClone.components.camera.CameraFocusComponent}
		 */
		_focusComponent					:null,

		/**
		 * Stores current status of each key
		 * @type {Object}
		 */
		_keyStates					  : {
			left: false,
			right: false,
			up: false,
			down: false,
			angle: 0
		},

        /**
         * @type {Object}
         */
        cmdMap      : {},

		/**
		 * @type {Number}
		 */
		_idleTimeout					: null,

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.player.RemoteJoystickInputComponent.superclass.attach.call(this, anEntity);
            
            ChuClone.GameViewController.INSTANCE.startPostProcessing();
            clearTimeout(waitingToRefreshTimeout);
		},

		/**
		 * @inheritDoc
		 */
		execute: function() {
			ChuClone.components.player.RemoteJoystickInputComponent.superclass.execute.call(this);
		},


///// NETCHANNEL DELEGATE
		netChannelDidConnect: function() {
			this.netChannel.addMessageToQueue(true, RealtimeMultiplayerGame.Constants.CMDS.PLAYER_JOINED, {type: "cabinet" });
		},

		netChannelDidReceiveMessage: function(aMessage) {
			this.log("RecievedMessage", aMessage);
		},
		netChannelDidDisconnect: function() {
			this.log("netChannelDidDisconnect", arguments);
		},

		update: function() {
			if (!this.netChannel) {
				return;
			}
			if (!this._focusComponent) {
				this._focusComponent = ChuClone.GameViewController.INSTANCE.getCamera().getComponentWithName(ChuClone.components.camera.CameraFocusRadiusComponent.prototype.displayName)
			}

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
			this.speedFactor = delta / ( 1000 / this.targetFramerate );
			if (this.speedFactor <= 0) this.speedFactor = 1;
		},

		/**
		 * Called when the joystick sends an 'Update' command
		 * @param {Object} message
		 */
		joystickUpdate: function(message) {
			// Check if the message recieved was for loading another level -
			// If it was - refresh the page to load that level
            var level = ChuClone.utils.getLevelIDFromURL();
            if( level != message.payload.level && this.forceLoadedLevel != level) {
                if( !message.payload.level ) {
                    console.log("No level in payload!");
                } else {
                    this.forceLoadedLevel = level;
                    loadLevel(message.payload.level);
                    return;
                }
            }
			var angle = +message.payload.analog
			this._keyStates['left'] = angle != 0 && angle < 360 && angle > 180;
			this._keyStates['right'] = angle > 0 && angle < 180;
			this._keyStates['up'] = message.payload.button;

			this.resetIdleTimer();

			// Use the accelerometer to move the camera
			if (this._focusComponent) {
				this._focusComponent._mousePosition.x = (message.payload.accelY) / 10;
				this._focusComponent._mousePosition.x *= 0.5;
				this._focusComponent._mousePosition.x += 0.5;
				this._focusComponent._mousePosition.y = (message.payload.accelX) / 10;
				this._focusComponent._mousePosition.y *= 0.5;
				this._focusComponent._mousePosition.y += 0.6;
			}
		},

		/**
		 * Called when the joystick sends an 'SelectLevel' command
		 * @param {Object} message
		 */
		joystickSelectLevel: function(message) {
			if (!message.payload.level_id) return;


			// KILL NET CHANNEL
			this.netChannel.dealloc();
			this.netChannel = null;

            loadLevel(message.payload.level_id);
		},


		resetIdleTimer: function() {
			var that = this;
			clearTimeout( this._idleTimeout );
			this._idleTimeout = setTimeout( function(){ that.onIdleTimerWasHit(); }, 5000);
		},

		onIdleTimerWasHit: function() {
			console.log("Idle for too long!")
            var level = ChuClone.utils.getLevelIDFromURL();
            if(level) { // if level is not null, that means
                window.location = "http://" + ChuClone.model.Constants.JOYSTICK.SERVER_LOCATION + ":3000/remoteplay/";
            }
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
			console.error("RemoteJoystickComponent.parseEntityDescriptionArray - Should never be called")
		},

		/**
		 * @return {Number}
		 */
		getGameClock: function() {
			return this.gameClock;
		},

		log: function() { console.log(arguments); },

        disconnect: function() {
            debugger;
            if (this.netChannel) this.netChannel.dealloc();
            this.netChannel = null;
            clearTimeout( this._idleTimeout );
        },

		/**
		 * Destroy the connection and clear memory
		 */
		detach: function() {

            // Send one last levelcomplete message and exit 
			if (this.netChannel) {
                var message = new RealtimeMultiplayerGame.model.NetChannelMessage( this.outgoingSequenceNumber, this.clientid, true, RealtimeMultiplayerGame.Constants.CMDS.LEVEL_COMPLETE, {levelcomplete: true} );
                this.netChannel.sendMessage( message );
                this.netChannel.dealloc();
            }
			clearTimeout( this._idleTimeout );
			this.netChannel = null;
			this._focusComponent = null;

            startWaitingToExit();
			ChuClone.components.player.RemoteJoystickInputComponent.superclass.detach.call(this);
		}
	};

    var waitingToRefreshTimeout = null;
    // Called on detach - starts waiting to send the game back to the titlescreen
    // This timeout is cleared on attach
    var startWaitingToExit = function(){
        var startLevel = ChuClone.utils.getLevelIDFromURL();
        waitingToRefreshTimeout = setTimeout(function(){
            console.log("Waiting to refresh timeout hit! - Sending to titlescreen...");
            var currentLevel = ChuClone.utils.getLevelIDFromURL();
            if(currentLevel && currentLevel == startLevel) {
                window.location = "http://" + ChuClone.model.Constants.JOYSTICK.SERVER_LOCATION + ":3000/remoteplay/";
            }
        }, 5000);
    };

    var loadLevel = function( levelid ) {
        window.location = "http://" + ChuClone.model.Constants.JOYSTICK.SERVER_LOCATION + ":3000/remoteplay/" + levelid;
    };
	ChuClone.extend(ChuClone.components.player.RemoteJoystickInputComponent, ChuClone.components.BaseComponent);
})();