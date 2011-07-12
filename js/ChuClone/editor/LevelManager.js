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
     this._levelManager = new ChuClone.editor.LevelManager();
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
    ChuClone.editor.LevelManager = function() {
    };

    ChuClone.editor.LevelManager.prototype = {
        /**
         * @type {ChuClone.editor.LevelModel}
         */
        _levelModel         : null,

        /**
         * @type {Object}
         */
        _controllers        : {},

        _currentSlot        : 0,
        _currentName        : "NONAME",
        _saveSlots          : null,

        EVENTS              : {
            LEVEL_CREATED   : "LevelManager.Events.WorldCreated",
            LEVEL_DESTROYED : "LevelManager.Events.LevelDestroyed"
        },

        setupGui: function() {
             // Creation gui
            this._gui = new DAT.GUI({width: ChuClone.Constants.EDITOR.PANEL_WIDTH + 50});
            this._gui.name("LevelManager");
            this._gui.autoListen = false;

            this._controllers['slot'] = this._gui.add(this, '_currentSlot').options([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).name("Save Slot");
            this._controllers['slot'].domElement.childNodes[1].selectedIndex = parseInt( localStorage.getItem("lastSlot") )
            this._controllers['name'] = this._gui.add(this, '_currentName').name("Level Name").onFinishChange(function(){ });
            this._controllers['saveLevelToSlot'] = this._gui.add(this, 'saveLevelToSlot').name("Save Level");
            this._controllers['loadLevelFromSlot'] = this._gui.add(this, 'loadLevelFromSlot').name("Load Level");
            this._controllers['resetLevel'] = this._gui.add(this, 'resetLevel').name("Clear Level");


            this._gui.close();
            this._gui.open();
        },

        /**
         * Loads the last level saved
         */
        loadLatestLevel: function() {
            try {
                this.loadLevelFromSlot(parseInt(localStorage.getItem("lastSlot")));
            } catch (error) {
                console.log("LevelManager.loadLatestLevel - Load failed")
            }
        },



        /**
         * Saves the current level a save slot from HTML5 local storage
		 * @type {ChuClone.physics.WorldController}	The WorldController that will be parsed
         */
        saveLevelToSlot: function( aWorldController) {
            var model = new ChuClone.editor.LevelModel();
            var data = model.parseLevel( aWorldController, this._currentName );
            var slot = "slot"+this._currentSlot;

            localStorage.setItem(slot, data);
            localStorage.setItem("lastSlot", this._currentSlot);
            this._levelModel = model;
        },

        /**
         * Loads the level at the '_currentSlot'
         * Will call 'loadLevelFromJSONString'
		 * @type {ChuClone.physics.WorldController}	The WorldController that will be parsed
		 * @type {ChuClone.GameViewController}	a GameViewController
         */
        loadLevelFromSlot: function( aWorldController, gameViewController ) {

			// No worldcontroller specified - grab from editor but if there's no editor, let fail loudly
			if( !aWorldController || gameViewController ) {
				aWorldController = ChuClone.editor.WorldEditor.getInstance().getWorldController();
				gameViewController = ChuClone.editor.WorldEditor.getInstance().getViewController();
			}

            this.clearLevel( aWorldController, gameViewController );

            var slot = "slot"+this._currentSlot;
            var data = localStorage.getItem(slot);
            this.loadLevelFromJSONString(aWorldController, gameViewController, data );
        },

        /**
         * Retrieves a level from a URL
         * Will call 'loadLevelFromJSONString'
		 * @type {ChuClone.physics.WorldController}	The WorldController that the level will load into
		 * @type {ChuClone.GameViewController}	a GameViewController
         * @param {String} aURL
         */
        loadLevelFromURL: function( aWorldController, gameViewController, aURL ) {
            this.clearLevel();
            
            var url = ChuClone.utils.getCWD() + aURL;
            var request = new XMLHttpRequest();
            var that = this;
            request.onreadystatechange = function() {
                if( request.readyState == 4 ) {
                    that.loadLevelFromJSONString( aWorldController, gameViewController, request.responseText );
                }
            };
            request.open("GET", url );
            request.send(null);
        },

        /**
         * Creates a model object and loads a level into it.
         * This is the ultimate end call for loadLevelFromSlot & loadLevelFromURL
		 * @type {ChuClone.physics.WorldController}	The WorldController that the level will load into
		 * @type {ChuClone.GameViewController}	a GameViewController
         * @param {String} JSONString
         * @return {ChuClone.editor.LevelModel}
         */
        loadLevelFromJSONString: function( aWorldController, gameViewController, JSONString ) {
            var model = new ChuClone.editor.LevelModel();
            model.fromJsonString( JSONString, aWorldController, gameViewController);

            if( this._controllers.length ) {
                // Set the current name, and emit the loaded event
                this._controllers['name'].setValue( model.levelName );
            }

            this._levelModel = model;
			ChuClone.Events.Dispatcher.emit( ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_CREATED, this );
            return model;
        },

        /**
         * Clears the level and dispatches the recreate event
         */
        resetLevel: function() {
            this.clearLevel( ChuClone.editor.WorldEditor.getInstance().getWorldController(), ChuClone.editor.WorldEditor.getInstance().getViewController() );
        },
        /**
         * Clears a level
		 * @type {ChuClone.physics.WorldController}	The WorldController instance that will be cleared
		 * @type {ChuClone.GameViewController}	a GameViewController
         */
        clearLevel: function( aWorldController, gameViewController ) {

            var node = aWorldController.getWorld().GetBodyList();
            while (node) {
                var b = node;
                node = node.GetNext();


                /**
                 * @type {ChuClone.GameEntity}
                 */
                var entity = b.GetUserData();

                if (!entity) {
                    aWorldController.getWorld().DestroyBody(b);
                    continue;
                }

                if( "getView" in entity )
                    gameViewController.removeObjectFromScene( entity.getView() );

                if( "dealloc" in entity )
                    entity.dealloc();

                aWorldController.getWorld().DestroyBody(b);
            }

           ChuClone.Events.Dispatcher.emit( ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_DESTROYED, this );
        }


        ///// ACCESSORS


    }
})();