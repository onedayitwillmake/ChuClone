/**
File:
	PlayLevelState.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	Gameplaying state
 
 Basic Usage:

 License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    "use strict";

	ChuClone.namespace("ChuClone.states");

	ChuClone.states.PlayLevelState = function() {
		ChuClone.states.PlayLevelState.superclass.constructor.call(this);
		this._record = [];
	};

	ChuClone.states.PlayLevelState.prototype = {

        /**
         * @type {Number}
         */
        _currentTime    : 0,
        _previousTime   : 0,
        _elapsedTime    : 0,
		_elapsedFrames	: 0,

        _lastTextUpdate : 0,
        
        /**
         * @type {ChuClone.GameViewController}
         */
        _gameView: null,

        /**
         * @type {ChuClone.physics.WorldController}
         */
        _worldController: null,

        /**
         * @type {ChuClone.editor.LevelManager}
         */
        _levelManager: null,

        /**
         * @type {ChuClone.GameEntity}
         */
        _player         : null,

		/**
		 * @type {Array}
		 */
		_record			: null,

        /**
         * @type {Array}    Array of our extra mesh items
         */
        _backgroundElements: [],

        // Internal state
        _beatLevel      : false,
        _didAnimateIn   : false,

		/**
		 * @inheritDoc
		 */
		enter: function() {
			ChuClone.states.PlayLevelState.superclass.enter.call(this);
            this.removeEditContainer();

            // Hide the camera before we animate in
            this._gameView.getCamera().position = new THREE.Vector3(-10000, -10000, -10000);

			// Reset achievement tracker
			ChuClone.model.AchievementTracker.getInstance().reset();

            this._didAnimateIn = false;
            this._beatLevel = false;
            this._previousTime = Date.now();
		},

        animateIn: function() {
            var player = null;
			var goalpad = null;

			var width = 100000;
			var geometry = new THREE.PlaneGeometry(width, 10000, 10, 1);

			var mesh = new THREE.Mesh(geometry, [new THREE.MeshBasicMaterial({
						color: 0xeeeeee, shading: THREE.FlatShading,
						wireframe: true
					})]);

			var centerPosition = new THREE.Vector3(width/2, -500,0);
			mesh.dynamic = false;
			mesh.position.x = centerPosition.x;
			mesh.position.y = centerPosition.y;
			mesh.position.z = centerPosition.z;
			mesh.rotation.x = 90 * Math.PI/180;

				this._gameView.addObjectToScene(mesh);

            var node = this._worldController.getWorld().GetBodyList();
            this._player.getBody().SetActive( false );

            while(node) {

                var b = node;
                node = node.GetNext();

				/**
				 * @type {ChuClone.GameEntity}
				 */
				var entity = b.GetUserData();
				if (!(entity instanceof ChuClone.GameEntity) ) continue;
				if( entity.getComponentWithName(ChuClone.components.player.CharacterControllerComponent.prototype.displayName) ) {
                    player = entity;
                    continue;
                }
				if( entity.getComponentWithName(ChuClone.components.GoalPadComponent.prototype.displayName) ) {
                    goalpad = entity;
                    continue;
                }

				entity.getView().visible = false;

				var end = b.GetPosition();
				var start = {x: end.x + ChuClone.utils.randFloat(-100, 100), y: end.y + ChuClone.utils.randFloat(-100, 100), z: ChuClone.utils.randFloat(-10000, 10000) };
				var end = {x: b.GetPosition().x, y: b.GetPosition().y, z: 0};
				var prop = {target: b, entity: entity.getView(), x: start.x, y: start.y, z: start.z};

				b.SetPosition(new Box2D.Common.Math.b2Vec2(start.x, start.y))
				entity.getView().position.z = start.z;
				entity.getView().visible = true;
                var animationTime = 1000;
                var variation = 200;

				var tween = new TWEEN.Tween(prop)
						.to({x: end.x, y: end.y, z: end.z}, animationTime)
						.delay(Math.random() * variation )
						.onUpdate(function() {
							this.target.SetPosition(new Box2D.Common.Math.b2Vec2(this.x, this.y));
							this.entity.position.z = this.z;
						})
						.easing(TWEEN.Easing.Circular.EaseInOut)
						.start();
			}

            this.animateCameraIn( player, goalpad, animationTime+variation);
        },

        /**
         * Animates the camera from the goalpad to the players position
         * @param {ChuClone.GameEntity} player
         * @param {ChuClone.GameEntity} goalpad
         * @param {Number} duration
         */
        animateCameraIn: function( player, goalpad, duration) {

            var that = this;


			var delta = new THREE.Vector3();
			delta.add(player.getView().position, goalpad.getView().position)
			//delta.multiplyScalar(0.5);


            var cam = this._gameView.getCamera();
            var camStart = delta;
            camStart.x += 0;
            //camStart.y += 3000;
            camStart.z += 0;

            var camEnd = player.getView().position.clone();
            //camEnd.x = 1000;
            //camEnd.y += 1000;
            //camEnd.z += 1000;

            // Temporarily remove the components - we'll set them back when we're done animating
            var components = cam.getComponents();
            cam.components = [];
            cam.position = camStart.clone();

            var prop = {target: cam, x:camStart.x, y: camStart.y, z: camStart.z};
            new TWEEN.Tween(prop)   
                .to({x: camEnd.x, y: camEnd.y, z: camEnd.z}, duration)
                .onUpdate(function(t) {
                    this.target.position.x = this.x;
                    this.target.position.y = this.y;
                    this.target.position.z = this.z;
                    this.target.target.position = player.getView().position.clone();
                })
                .onComplete(function() {
                    cam.components = components;
                    that.animateInComplete();
					cam.getComponentWithName(ChuClone.components.camera.CameraFocusRadiusComponent.prototype.displayName)._mousePosition.x = 3.5
                })
                .easing(TWEEN.Easing.Quadratic.EaseInOut)
                .start();
        },

        /**
         * Fired on animate in complete
         */
        animateInComplete: function() {
            this._currentTime = 0;
            this._previousTime = 0;
            this._elapsedTime = 0;
			this._elapsedFrames = 0;

            this._previousTime = Date.now();
			this._recording = [];

            this._didAnimateIn = true;
            this._player.getBody().SetActive( true );
        },

		/**
		 * Setup events related to this state
		 */
        setupEvents: function() {
            var that = this;
            this.addListener( ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_CREATED, function( aLevelManager ) { that.onLevelLoaded( aLevelManager ) } );
            this.addListener( ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_DESTROYED, function( aLevelManager ) { that.onLevelDestroyed( aLevelManager ) } );
            this.addListener( ChuClone.components.player.CharacterControllerComponent.prototype.EVENTS.CREATED, function( aPlayer ) { that.onPlayerCreated(aPlayer) } );
            this.addListener( ChuClone.components.player.CharacterControllerComponent.prototype.EVENTS.REMOVED, function( aPlayer ) { that.onPlayerDestroyed(aPlayer) } );
            this.addListener( ChuClone.components.GoalPadComponent.prototype.EVENTS.GOAL_REACHED, function( aGoalPad ) { that.onGoalReached( aGoalPad ) } );
        },

        /**
         * @inheritDoc
         */
        update: function() {
            ChuClone.states.PlayLevelState.superclass.update.call(this);
			  this._elapsedFrames++;
            this.updateTime();
			this.updatePhysics();
            this._gameView.update( this._currentTime );


            // Don't update canvas clock every frame
            if( this._currentTime - this._lastTextUpdate > 128 ) {
                this._lastTextUpdate = this._currentTime;
                ChuClone.gui.HUDController.setTimeInSeconds( this._elapsedTime );
            }

            this._worldController.update();

        },

		/**
		 * Updates elapsed time until level is completed
		 */
        updateTime: function() {
            if( this._beatLevel || !this._didAnimateIn )
                return;
            
            this._currentTime = Date.now();
            this._elapsedTime += this._currentTime - this._previousTime;
            this._previousTime = this._currentTime;

        },

		/**
		 * Restarts the clock
		 */
		resetTime: function() {
			this._elapsedTime = 0;
			this._lastTextUpdate = 0;
			this._previousTime = Date.now();
		},

        /**
		 * Sets up the camera
		 */
		setupCamera: function() {
			// Attach a few gameplay related components to the camera
			var gameCamera = this._gameView.getCamera();

			// Follow the player
			var followPlayerComponent = new ChuClone.components.camera.CameraFollowPlayerComponent();
			if( this._player ) followPlayerComponent.setPlayer( this._player );
			gameCamera.addComponentAndExecute( followPlayerComponent );

			// Allow rotation about target
			var focusComponent = new ChuClone.components.camera.CameraFocusRadiusComponent();
			gameCamera.addComponentAndExecute(focusComponent);
			focusComponent.getRadius().x = 100;
			focusComponent.getRadius().y = 100;
			focusComponent.getRadius().z = 2000;
		},

         /**
		 * Called when a goal is hit
		 * @param {ChuClone.components.GoalPadComponent} aGoalComponent
		 */
		onGoalReached: function( aGoalComponent ) {
			 ChuClone.gui.HUDController.setTimeInSeconds( this._elapsedTime );

             this._beatLevel = true;
             

             var recorder = this._player.getComponentWithName( ChuClone.components.player.PlayerRecordComponent.prototype.displayName);
             var playerRecord = null;
             if( recorder ) {
                 playerRecord = JSON.stringify( recorder.getRecord() );
				 console.log(playerRecord)
                 this._player.removeComponentWithName( ChuClone.components.player.PlayerRecordComponent.prototype.displayName);
             }

             /**
              * @type {ChuClone.states.EndLevelState}
              */
             var endLevelState = new ChuClone.states.EndLevelState();
             endLevelState._gameView = this._gameView;
             endLevelState._worldController = this._worldController;
			 endLevelState._levelManager = this._levelManager;
             endLevelState.setPlayer( this._player );
             endLevelState.setTime( this._elapsedTime );
             endLevelState.setRecord( playerRecord );
             ChuClone.model.FSM.StateMachine.getInstance().changeState(endLevelState);
		},

        onPlayerCreated: function( aPlayer ) {
            this._player = aPlayer;

            // Add component to check the players boundary
            this._player.addComponentAndExecute( new ChuClone.components.BoundsYCheckComponent() );

            // Set the player target for the follow player component
            this._gameView.getCamera()
                    .getComponentWithName( ChuClone.components.camera.CameraFollowPlayerComponent.prototype.displayName )
                    .setPlayer( this._player );

            // Respawn at nearest respawnpoint
            var respawnPoint = ChuClone.components.RespawnComponent.prototype.GET_CURRENT_RESPAWNPOINT();
            respawnPoint.setSpawnedEntityPosition( this._player );

			this.startRecordingPlayer();
			//this.startRecordingPlayback();
            this.animateIn();
        },

		/**
		 * Dispatched when a player is destroyed.
		 * Removes _player reference
		 * @param {ChuClone.GameEntity} aPlayer
		 */
        onPlayerDestroyed: function( aPlayer ) {
            if( aPlayer === this._player ) {
                this._player = null;
            }
        },

        /**
		 * Called when a goal is hit
		 * @param {ChuClone.editor.LevelManager} aLevelManager
		 */
		onLevelLoaded: function( aLevelManager ) {
            this._isLevelLoaded = true;
			this.resetTime();
            this.setupCamera();
            this._worldController.createBox2dWorld();
		},

        /**
         * Level was destroyed - probably about to exit.
         * Remove components?
         */
        onLevelDestroyed: function() {
            if( this._isLevelLoaded ) {
                /**
                * @type {ChuClone.states.PlayLevelState}
                */
                var playLevelState = new ChuClone.states.PlayLevelState();
                playLevelState._gameView = this._gameView;
                playLevelState._worldController = this._worldController;
                playLevelState._levelManager = this._levelManager;
                ChuClone.model.FSM.StateMachine.getInstance().changeState(playLevelState);
            }

        },

		/**
		 * Records the players movements
		 */
		startRecordingPlayer: function() {
			var playerRecorder = new ChuClone.components.player.PlayerRecordComponent();
			playerRecorder.setClockDelegate( this );
			this._player.addComponentAndExecute( playerRecorder );
		},

		/**
		 * Takes over the playercontrol plays back a recording
		 */
		startRecordingPlayback: function() {
			var playerPlayback = new ChuClone.components.player.PlayerPlaybackComponent();
			playerPlayback.setClockDelegate( this );
			this._player.addComponentAndExecute( playerPlayback );
		},

		/**
		 * Removes the editcontainer node if it's around
		 */
		removeEditContainer: function(){
			if(!document.getElementById("editorContainer")) return;
				document.getElementById("editorContainer").parentNode.removeChild(document.getElementById("editorContainer")); // Remove the editcontainer
		},

        /**
         * @inheritDoc
         */
        exit: function() {
            clearTimeout( this._animateInTimeout );

            this._gameView.getCamera().removeComponentWithName( ChuClone.components.camera.CameraFollowPlayerComponent.prototype.displayName );
			this._gameView.getCamera().removeComponentWithName( ChuClone.components.camera.CameraFocusRadiusComponent.prototype.displayName );
			ChuClone.states.PlayLevelState.superclass.exit.call(this);
        },

        /**
         * @inheritDoc
         */
        dealloc: function() {
			this._player = null;
			ChuClone.states.PlayLevelState.superclass.dealloc.call(this);
        },


		/**
		 * Sets the current _playerEntity
		 * @param {ChuClone.GameEntity} aPlayer
		 */
		setPlayer: function( aPlayer ) {
			var respawnPoint = ChuClone.components.RespawnComponent.prototype.GET_CURRENT_RESPAWNPOINT();
			respawnPoint.setSpawnedEntityPosition( aPlayer );
			this._player = aPlayer;
		},

		/**
		 * return @{type} Number The current _elapsedTime
		 */
		getCurrentTime: function() { return this._elapsedFrames; }
	};

    ChuClone.extend( ChuClone.states.PlayLevelState, ChuClone.states.ChuCloneBaseState );
})();