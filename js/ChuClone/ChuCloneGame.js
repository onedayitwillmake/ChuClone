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



//            this.debugSetupRandomBlocks();
            this.debugSetupPlayer();
//            this.spawnPlayer();


            // MAIN LOOP
            var that = this;
            (function loop() {
                that.update();
                window.requestAnimationFrame( loop, null );
            })();
        },
        
        setupEvents: function() {
            var that = this;
            ChuClone.Events.Dispatcher.addListener(ChuClone.PlayerEntity.prototype.EVENTS.CREATED, function( aPlayer ) {
                that.onPlayerCreated( aPlayer );
            });

            // WORLD CREATED
            ChuClone.Events.Dispatcher.addListener(ChuClone.editor.LevelManager.prototype.EVENTS.WORLD_CREATED, function( aLevelModel ) {
//                that._worldController.createBox2dWorld();
                that.onBeforeStart( aLevelModel );
            });

            // LEVEL DESTROYED
            ChuClone.Events.Dispatcher.addListener(ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_DESTROYED, function( aLevelModel ) {

                // Remove any components the camera had attached
                // TODO: LET FAIL LOUDLY IF CAMERA HAS NO PROPERTY NAMED COMPONENTS?
                if( that._gameView.getCamera().hasOwnProperty("components") ) {
                    console.log(that._gameView.getCamera());


                }

                that._gameView.getCamera().removeAllComponents();
//                that._worldController.createBox2dWorld();
            });

            // GOAL REACHED
            ChuClone.Events.Dispatcher.addListener(ChuClone.components.GoalPadComponent.prototype.EVENTS.GOAL_REACHED, function( aGoalComponent ) {
                console.log("GOAL REACHED YO!")
            });

            // LISTEN FOR ON FOCUS
            window.addEventListener("focus", function(e) {that._hasFocus = true; }, false);
            window.addEventListener("blur", function(e) { that._hasFocus = false; }, false);
        },

        /**
         * Sets up the LevelManager
         */
        setupLevelManager: function() {
            this._levelManager = new ChuClone.editor.LevelManager( this._worldController, this._gameView );
            this._levelManager.setupGui();
//            this._levelManager.loadLevelFromURL("/assets/levels/Piano.json");
            this._levelManager.loadLevelFromURL("/assets/levels/HelloWorld.json");
//            this._levelManager.loadLatestLevel();
        },

        setupView: function() {
            this._gameView = new ChuClone.GameViewController();
            this._gameView.onResize( null );
        },

        setupWorldController: function() {
            this._worldController = new ChuClone.physics.WorldController();
            this._worldController.setDebugDraw();
            this._worldController.setupEditor( this._gameView );
        },

        debugSetupRandomBlocks: function() {
            for ( var i = 0; i < 100; i ++ ) {
                var w = Math.random() * 300 + 200;
                var h = Math.random() * 300;

                var x = i*(w*2);
                var y = i*h;//Math.abs(Math.sin(i/10))*-150 + Math.random() * 200 + 300;
                var body = this._worldController.createRect( x, y, 0, w, h, true );
                var view = this.view.createEntityView( x, y, w*2, h*2, 500  );
                var entity = new ChuClone.GameEntity();
                entity.setBody( body );
                entity.setView( view );
                entity.setDimensions( w, h, 1000 );

                this.view.addEntity( entity.view );
            }
        },

        /**
         * Called when a level is about to start
         * For example a level has been loaded or like whatever
         * @param {ChuClone.editor.LevelModel} aLevelModel
         */
        onBeforeStart: function( aLevelModel ) {
            this._worldController.createBox2dWorld();

            // Check if levelmodel has a player
            var player = aLevelModel.getPlayers();

            console.log( player );
        },


        /**
         * Main loop for game engine
         */
        update: function() {
            if(!this._hasFocus)
                return;
            
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
            this._gameView.update( Date.now() );
        }
    };
}());
