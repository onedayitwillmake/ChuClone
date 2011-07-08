/**
 File:
    ChuCloneGame.js
 Created By:
    Mario Gonzalez - mariogonzalez@gmail.com
 Project:
    ChuClone
 Abstract:
    This class handles the saving/loading of levels
 Basic Usage:
     this._levelManager = new ChuClone.editor.LevelManager( this._worldController, this._gameView );
     this._levelManager.setupGui();
 Version:
    1.0

 License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    "use strict";
    
    ChuClone.namespace("ChuClone.editor");
    ChuClone.editor.LevelManager = function( aWorldController, aGameView ) {
        this._worldController = aWorldController;
        this._gameView = aGameView;
    };

    ChuClone.editor.LevelManager.prototype = {
        /**
         * @type {ChuClone.editor.LevelModel}
         */
        _levelModel         : null,
        /**
         * @type {ChuClone.physics.WorldController}
         */
        _worldController    : null,
        /**
         * @type {ChuClone.GameViewController}
         */
        _gameView           : null,
        /**
         * @type {Object}
         */
        _controllers        : {},

        _currentSlot        : 0,
        _currentName        : "NONAME",
        _saveSlots          : null,

        EVENTS              : {
            WORLD_CREATED   : "LevelManager.Events.WorldCreated"
        },

        setupGui: function() {
             // Creation gui
            this._gui = new DAT.GUI({width: ChuClone.Constants.EDITOR.PANEL_WIDTH + 50});
            this._gui.name("LevelManager");
            this._gui.autoListen = false;

            this._controllers['slot'] = this._gui.add(this, '_currentSlot').options([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).name("Save Slot")
            this._controllers['slot'].domElement.childNodes[1].selectedIndex = parseInt( localStorage.getItem("lastSlot") )
            this._controllers['name'] = this._gui.add(this, '_currentName').name("Level Name").onFinishChange(function(){ });
            this._controllers['saveLevelToSlot'] = this._gui.add(this, 'saveLevelToSlot').name("Save Level");
            this._controllers['loadLevelFromSlot'] = this._gui.add(this, 'loadLevelFromSlot').name("Load Level");
            this._controllers['clearLevel'] = this._gui.add(this, 'clearLevel').name("Clear Level");

            this._gui.close();
        },



        /**
         * Saves the current level a save slot from HTML5 local storage
         */
        saveLevelToSlot: function() {
            var model = new ChuClone.editor.LevelModel();
            var data = model.parseLevel( this._worldController, this._currentName );
            var slot = "slot"+this._currentSlot;

            localStorage.setItem(slot, data);
            localStorage.setItem("lastSlot", this._currentSlot);

        },

        /**
         * Loads the level at the '_currentSlot'
         * Will call 'loadLevelFromJSONString'
         */
        loadLevelFromSlot: function() {
            this.clearLevel();

            var slot = "slot"+this._currentSlot;
            var data = localStorage.getItem(slot);
            this.loadLevelFromJSONString( data );
        },

        /**
         * Retrieves a level from a URL
         * Will call 'loadLevelFromJSONString'
         * @param {String} aURL
         */
        loadLevelFromURL: function( aURL ) {
            this.clearLevel();
            
            var url = window.location.href + "assets/levels/HelloWorld.json";
            var request = new XMLHttpRequest();
            var that = this;
            request.onreadystatechange = function() {
                if( request.readyState == 4 ) {
                    that.loadLevelFromJSONString( request.responseText );
                }
            };
            request.open("GET", url );
            request.send(null);
        },

        /**
         * Creates a model object and loads a level into it.
         * This is the ultimate end call for loadLevelFromSlot & loadLevelFromURL
         * @param {String} JSONString
         */
        loadLevelFromJSONString: function( JSONString ) {
            var model = new ChuClone.editor.LevelModel();
            model.fromJsonString( JSONString,  this._worldController,  this._gameView );

            // Set the current name, and emit the loaded event
            this._controllers['name'].setValue( model.levelName );
            ChuClone.Events.Dispatcher.emit( ChuClone.editor.LevelManager.prototype.EVENTS.WORLD_CREATED, model );
        },

        /**
         * Clears a level
         */
        clearLevel: function() {
            var node = this._worldController.getWorld().GetBodyList();
            while (node) {
                var b = node;
                node = node.GetNext();


                /**
                 * @type {ChuClone.GameEntity}
                 */
                var entity = b.GetUserData();

                if (!entity) {
                    this._worldController.getWorld().DestroyBody(b);
                    continue;
                }

                if( "getView" in entity )
                    this._gameView.removeObjectFromScene( entity.getView() );

                if( "dealloc" in entity )
                    entity.dealloc();

                this._worldController.getWorld().DestroyBody(b);
            }
        }
    }
})();