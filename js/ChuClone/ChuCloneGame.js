/**
 File:
    ChuCloneGame.js
 Created By:
    Mario Gonzalez - mariogonzalez@gmail.com
 Project:
    ChuClone
 Abstract:
    This is the main entry point for the game ChuClone
 Basic Usage:
     // Assumes all files are loaded
    var game = new ChuClone.ChuCloneGame();
 Version:
    1.0

 License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    "use strict";
    
    var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
    ChuClone.namespace("ChuClone");
    ChuClone.ChuCloneGame = function() {
        this.listenForReady();
    };

    ChuClone.ChuCloneGame.prototype = {

        /**
         * @type {Boolean}
         */
        _hasFocus   : true,

        _stateMachine   : null,
        
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
         * @type {ChuClone.PlayerEntity}
         */
        _player         : null,

        /**
         * Container of closures used in event callbacks
         * @type {Object}
         */
        _closures   : {},

         /**
         * Listens for DOMContentLoaded event
         */
        listenForReady: function() {
            var that = this;

            window.addEventListener('DOMContentLoaded', function callback(e){
                window.removeEventListener('DOMContentLoaded', callback, false);
                that.onReady()
            }, false);
        },
        
        setupEvents: function() {

            var that = this;
			var dispatch = ChuClone.Events.Dispatcher;

			// Listen for PLAYER created/destroyed
            dispatch.addListener(ChuClone.PlayerEntity.prototype.EVENTS.CREATED, function( aPlayer ) { that.onPlayerCreated(aPlayer); });
            dispatch.addListener(ChuClone.PlayerEntity.prototype.EVENTS.DESTROYED, function( aPlayer ) { that.onPlayerDestroyed(aPlayer); });

			// Listen for LEVEL created/destroyed
            dispatch.addListener(ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_CREATED, function( aLevelManager ) { that.onLevelCreated( aLevelManager ); });
            dispatch.addListener(ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_DESTROYED, function( aLevelManager ) { that.onLevelDestroyed( aLevelManager); });

            // Listen for GOAL reached
            dispatch.addListener(ChuClone.components.GoalPadComponent.prototype.EVENTS.GOAL_REACHED, function( aGoalComponent ) {
                console.log("GOAL REACHED YO!")
            });

            // LISTEN FOR ON FOCUS
            window.addEventListener("focus", function(e) {that._hasFocus = true; }, false);
            window.addEventListener("blur", function(e) { that._hasFocus = false; }, false);
        },

		/**
         * Dispatched when 'DOMContentLoaded' event is fired
         * @type {Event}    'DOMContentLoaded' event
         */
        onReady: function(e) {
            ChuClone.Constants.EDITOR.PANEL_DOMELEMENT = document.getElementById("guiContainer");

            this.setupEvents();
            this.setupView();
            this.setupWorldController();
            this.setupLevelManager();

            this._stateMachine = new ChuClone.model.FSM.StateMachine();

            // HACKY FOR NOW but just stuff our props in there

            var editState = new ChuClone.states.EditState();
            editState._worldController = this._worldController;
            editState._gameView = this._gameView;
            editState._levelManager = this._levelManager;
            editState._player = this._player;
            
            this._stateMachine.setInitialState( editState );

            // MAIN LOOP
            var that = this;
            (function loop() {
                that.update();
                window.requestAnimationFrame( loop, null );
            })();
        },

		/**
		 * Called when a player is created
		 * @param aPlayer
		 */
		onPlayerCreated: function( aPlayer ) {
			console.log("ChuCloneGame.onPlayerCreated:", aPlayer);
		},

		/**
		 * Called when a player is destroyed
		 * @param aPlayer
		 */
		onPlayerDestroyed: function( aPlayer ) {
			console.log("ChuCloneGame.onPlayerDestroyed:", aPlayer);
		},

		onLevelCreated: function( aLevelManager ) {
			this._worldController.createBox2dWorld();
			console.log("ChuCloneGame.onLevelCreated:", aLevelManager);
		},

		onLevelDestroyed: function( aLevelManager ) {
			console.log("ChuCloneGame.onLevelDestroyed:", aLevelManager);
			this._gameView.getCamera().removeAllComponents();
			this._worldController.createBox2dWorld();
		},

        /**
         * Sets up the LevelManager
         */
        setupLevelManager: function() {
            this._levelManager = new ChuClone.editor.LevelManager();
            this._levelManager.setupGui();
//            this._levelManager.loadLevelFromURL("/assets/levels/Piano.json");
//            this._levelManager.loadLevelFromURL("/assets/levels/HelloWorld.json");
//            this._levelManager.loadLatestLevel();
        },

		/**
		 * Sets up the GameViewController
		 */
        setupView: function() {
            this._gameView = new ChuClone.GameViewController();
            this._gameView.onResize( null );
        },

		/**
		 * Sets up the WorldController
		 */
        setupWorldController: function() {
            this._worldController = new ChuClone.physics.WorldController();
            this._worldController.setDebugDraw();
            this._worldController.setupEditor( this._gameView );
        },

        /**
         * Called when a level is about to start
         * For example a level has been loaded or like whatever
         * @param {ChuClone.editor.LevelModel} aLevelModel
         */
        onBeforeStart: function( aLevelModel ) {
            this._worldController.createBox2dWorld();
        },


        /**
         * Main loop for game engine
         */
        update: function() {
            if(!this._hasFocus)
                return;

            this._stateMachine.update();
        }
    };
}());
