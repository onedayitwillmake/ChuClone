/**
File:
	TitleScreenState.js
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

	ChuClone.states.TitleScreenState = function() {
		ChuClone.states.TitleScreenState.superclass.constructor.call(this);
	};

	ChuClone.states.TitleScreenState.prototype = {
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
		 * @inheritDoc
		 */
		enter: function() {
			ChuClone.states.TitleScreenState.superclass.enter.call(this);
            this.setupEvents();
		},

		/**
		 * Setup events related to this state
		 */
        setupEvents: function() {
            var that = this;
            this.addListener( ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_CREATED, function( aLevelManager ) { that.onLevelLoaded( aLevelManager ) } );
            this.addListener( ChuClone.components.CharacterControllerComponent.prototype.EVENTS.CREATED, function( aPlayer ) { that.onPlayerCreated(aPlayer) } );
            this.addListener( ChuClone.components.CharacterControllerComponent.prototype.EVENTS.REMOVED, function( aPlayer ) { that.onPlayerDestroyed(aPlayer) } );
            this.addListener( ChuClone.components.GoalPadComponent.prototype.EVENTS.GOAL_REACHED, function( aGoalPad ) { that.onGoalReached( aGoalPad ) } );
        },

        /**
         * @inheritDoc
         */
        update: function() {
            ChuClone.states.TitleScreenState.superclass.update.call(this);
            this.updateTime();

            /**
             * @type {Box2D.Dynamics.b2Body}
             */
            var node = this._worldController.getWorld().GetBodyList();
            while(node) {
                var b = node;
                node = node.GetNext();
                /**
                 * @type {ChuClone.GameEntity}
                 */
                var entity = b.GetUserData();
                if(entity)
                    entity.update();
            }

            this._worldController.update();
            this._gameView.update( this._currentTime );
        },

        /**
		 * Called when a goal is hit
		 * @param {ChuClone.editor.LevelManager} aLevelManager
		 */
		onLevelLoaded: function( aLevelManager ) {
			debugger;
			this.resetTime();
            this.setupCamera();
            this._worldController.createBox2dWorld();
		},

        /**
		 * Sets up the camera
		 */
		setupCamera: function() {
			// Attach a few gameplay related components to the camera
			var gameCamera = this._gameView.getCamera();

//			// Allow rotation about target
//			var focusComponent = new ChuClone.components.camera.CameraFocusRadiusComponent();
//			gameCamera.addComponentAndExecute(focusComponent);
//			focusComponent.getRadius().x = 1000;
//			focusComponent.getRadius().y = 1000;
//			focusComponent.getRadius().z = 2000;
		},

        onPlayerCreated: function( aPlayer ) {
			debugger;
        },

        onPlayerDestroyed: function( aPlayer ) {
            debugger;
        },

        /**
         * @inheritDoc
         */
        exit: function() {
            ChuClone.states.TitleScreenState.superclass.exit.call(this);

//			this._gameView.getCamera().removeComponentWithName( ChuClone.components.camera.CameraFollowPlayerComponent.prototype.displayName );
//			this._gameView.getCamera().removeComponentWithName( ChuClone.components.camera.CameraFocusRadiusComponent.prototype.displayName );


			this.removeAllListeners();
            this.dealloc();
        },

        /**
         * @inheritDoc
         */
        dealloc: function() {
			this.removeAllListeners();
            this._worldController = null;
            this._gameView = null;
            this._player = null;
        },
	};

    ChuClone.extend( ChuClone.states.TitleScreenState, ChuClone.model.FSM.State );
})();