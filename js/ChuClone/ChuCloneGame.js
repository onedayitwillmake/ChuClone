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
    
    var PTM_RATIO = ChuClone.model.Constants.PTM_RATIO;
    var levelBeforeStart = "";
    ChuClone.namespace("ChuClone");
    ChuClone.ChuCloneGame = function( aLevelToLoad ) {
		levelBeforeStart = aLevelToLoad;
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
         * @type {ChuClone.GameEntity}
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
            
            // LISTEN FOR ON FOCUS
            window.addEventListener("focus", function(e) {that._hasFocus = true; }, false);
            window.addEventListener("blur", function(e) { that._hasFocus = false; }, false);


			ChuClone.Events.Dispatcher.addListener(ChuClone.gui.LevelListing.prototype.EVENTS.SHOULD_CHANGE_LEVEL, function( levelFile ) {
                that._gameView.getCamera().removeAllComponents();
				that._levelManager.loadLevelFromURL( that._worldController, that._gameView, levelFile);
//				that._levelManager.loadLevelFromJSONString( that._worldController, that._gameView, "/assets/levels/"+levelFile+".json?r="+Math.floor(Math.random()*1000));
            });

        },

		/**
         * Dispatched when 'DOMContentLoaded' event is fired
         * @type {Event}    'DOMContentLoaded' event
         */
        onReady: function(e) {
            this.setupEvents();
            this.setupView();
            this.setupWorldController();
            this.setupLevelManager();

            this._stateMachine = new ChuClone.model.FSM.StateMachine();

            var initialState = null;
            if( ChuClone.model.Constants.IS_EDIT_MODE() ) {
                this._worldController.setDebugDraw();
                this._worldController.setupEditor( this._gameView );
                this._levelManager.setupGui();
                initialState = new ChuClone.states.EditState();
//				this._levelManager.loadLatestLevel();
            } else {
                document.getElementById("editorContainer").parentNode.removeChild(document.getElementById("editorContainer")); // Remove the editcontainer
                initialState = new ChuClone.states.PlayLevelState();
            }

            initialState._worldController = this._worldController;
            initialState._gameView = this._gameView;
            initialState._levelManager = this._levelManager;
            this._stateMachine.setInitialState( initialState );

			if(levelBeforeStart) {
				this._levelManager.loadLevelFromURL(this._worldController, this._gameView, levelBeforeStart);
			}
//			this._levelManager.loadLevelFromURL(this._worldController, this._gameView, "/assets/levels/SpeedUp_t.json");

            // MAIN LOOP
            var that = this;
            (function loop() {
                that.update();
				TWEEN.update();
                window.requestAnimationFrame( loop, null );
            })();
        },

        /**
         * Sets up the LevelManager
         */
        setupLevelManager: function() {
            this._levelManager = new ChuClone.editor.LevelManager();
        },

		/**
		 * Sets up the GameViewController
		 */
        setupView: function() {
            this._gameView = new ChuClone.GameViewController();
            this._gameView.onResize( null );
			ChuClone.utils.augmentCamera( this._gameView.getCamera() );
        },

		/**
		 * Sets up the WorldController
		 */
        setupWorldController: function() {
            this._worldController = new ChuClone.physics.WorldController();
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
