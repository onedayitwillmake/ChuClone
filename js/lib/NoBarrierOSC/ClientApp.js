//
//(function(){
//    var BASIL = new Basil("a", "");
//    BASIL.include("js/lib/caat.js");
//
////    console.log(BASIL)
//	JoystickDemo.ClientApp = function() {
//        console.log(BASIL, window);
//        console.log(new Date().getTime())
//        this.setup();
//	};
//
//	JoystickDemo.ClientApp.prototype = {
//
//		gameClockReal  			: 0,											// Actual time via "new Date().getTime();"
//		gameClock				: 0,											// Seconds since start
//		gameTick				: 0,											// Ticks/frames since start
//
//		speedFactor				: 1,											// Used to create Framerate Independent Motion (FRIM) - 1.0 means running at exactly the correct speed, 0.5 means half-framerate. (otherwise faster machines which can update themselves more accurately will have an advantage)
//		targetFramerate			: 60,											// Try to call our tick function this often, intervalFramerate, is used to determin how often to call settimeout - we can set to lower numbers for slower computers
//
//		netChannel				: null,											// ClientNetChannel instance
//		cmdMap					: {},											// Map some custom functions if wnated
//
//        _thumbStickController   : null,
//		_mousePosition			: {},		// Actual mouse position
//		_mousePositionNormalized: {},		// Mouse position 0-1
//
//        setup: function() {
//            this.gameClockReal = new Date().getTime();
//		    this.netChannel = new RealtimeMultiplayerGame.ClientNetChannel( this );
//
//            this._thumbStickController = new JoystickDemo.controls.ThumbStickController();
//            this._dpad = new JoystickDemo.controls.DirectionalPadController();
//
//            // Cancel
//            document.addEventListener("touchstart", function(e) { e.preventDefault()}, true);
//            document.addEventListener("touchmove", function(e) { e.preventDefault()}, true);
//            document.addEventListener("touchend", function(e) { e.preventDefault()}, true);
//            document.addEventListener("touchcancel", function(e) { e.preventDefault()}, true);
//        },
//
//		update: function() {
//			this.updateClock();
//
//			this.netChannel.addMessageToQueue( false, RealtimeMultiplayerGame.Constants.CMDS.PLAYER_UPDATE, {
//                up: this._dpad.getUp(),
//                down: this._dpad.getDown(),
//                left: this._dpad.getLeft(),
//                right: this._dpad.getRight(),
//                thumbstick: Math.round( this._thumbStickController.getAngle() * 180/Math.PI)
//            } );
//			this.netChannel.tick();
//		},
//
//        netChannelDidConnect: function() {
////            console.log("this.netChannel.getClientid()", this.netChannel.getClientid())
////            console.log("ABC")
//			this.joinGame( "user" + this.netChannel.getClientid() );
//		},
//
//		netChannelDidReceiveMessage: function( aMessage ) {
//			this.log("RecievedMessage", aMessage);
//		},
//		netChannelDidDisconnect: function() {
//			this.log("netChannelDidDisconnect", arguments);
//		},
//
//		/**
//		 * Updates the gameclock and sets the current
//		 */
//		updateClock: function() {
//			//
//			// Store previous time and update current
//			var oldTime = this.gameClockReal;
//			this.gameClockReal = new Date().getTime();
//
//			// Our clock is zero based, so if for example it says 10,000 - that means the game started 10 seconds ago
//			var delta = this.gameClockReal - oldTime;
//			this.gameClock += delta;
//			this.gameTick++;
//
//			// Framerate Independent Motion -
//			// 1.0 means running at exactly the correct speed, 0.5 means half-framerate. (otherwise faster machines which can update themselves more accurately will have an advantage)
//			this.speedFactor = delta / ( 1000/this.targetFramerate );
//			if (this.speedFactor <= 0) this.speedFactor = 1;
//		},
//
//		/**
//		 * Called by the ClientNetChannel, it sends us an array containing tightly packed values and expects us to return a meaningful object
//		 * It is left up to each game to implement this function because only the game knows what it needs to send.
//		 * However the 4 example projects in RealtimeMultiplayerNodeJS offer should be used ans examples
//		 *
//		 * @param {Array} entityDescAsArray An array of tightly packed values
//		 * @return {Object} An object which will be returned to you later on tied to a specific entity
//		 */
//		parseEntityDescriptionArray: function(entityDescAsArray) {
//			var entityDescription = {};
//
//			// It is left upto each game to implement this function because only the game knows what it needs to send.
//			// However the 4 example projects in RealtimeMultiplayerNodeJS offer this an example
//			entityDescription.entityid = +entityDescAsArray[0];
//			entityDescription.clientid = +entityDescAsArray[1];
//			entityDescription.entityType = +entityDescAsArray[2];
//			entityDescription.x = +entityDescAsArray[3];
//			entityDescription.y = +entityDescAsArray[4];
//
//			return entityDescription;
//		},
//
//		getGameClock: function() {
//		   return this.gameClock;
//		},
//
//		/**
//		 * Called when the user has entered a name, and wants to join the match
//		 * @param aNickname
//		 */
//		joinGame: function(aNickname) {
//			// Create a 'join' message and queue it in ClientNetChannel
//			this.netChannel.addMessageToQueue( true, RealtimeMultiplayerGame.Constants.CMDS.PLAYER_JOINED, { nickname: aNickname, type: "joystick" } );
//		},
//
//        log: function() { console.log.apply(console, arguments); }
//	};
//}());