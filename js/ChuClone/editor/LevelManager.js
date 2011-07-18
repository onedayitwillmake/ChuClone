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

        // TEMP HACK FOR NOW TO ACCESS FROM JS ON CLICK
        ChuClone.editor.LevelManager.INSTANCE = this;
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
		_prebuiltLevels		: 0,

        EVENTS              : {
            LEVEL_CREATED   : "LevelManager.Events.WorldCreated",
            LEVEL_DESTROYED : "LevelManager.Events.LevelDestroyed"
        },

        setupGui: function() {
			var that = this;
             // Creation gui
            this._gui = new DAT.GUI({width: ChuClone.model.Constants.EDITOR.PANEL_WIDTH + 50});
            this._gui.name("LevelManager");
            this._gui.autoListen = false;

            this._controllers['slot'] = this._gui.add(this, '_currentSlot').options([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).name("Save Slot");
            var slotIndex = parseInt( localStorage.getItem("lastSlot") );
            this._controllers['slot'].domElement.childNodes[1].selectedIndex = slotIndex;
            this._controllers['slot'].setValue( slotIndex )
            this._controllers['name'] = this._gui.add(this, '_currentName').name("Level Name").onFinishChange(function(){ });
            this._controllers['saveLevelToSlot'] = this._gui.add(this, 'saveLevelToSlot').name("Save Level");
            this._controllers['loadLevelFromSlot'] = this._gui.add(this, 'loadLevelFromSlot').name("Load Level");
            this._controllers['resetLevel'] = this._gui.add(this, 'resetLevel').name("Clear Level");
            this._controllers['pasteLevel'] = this._gui.add(this, 'pasteLevel').name("Paste Level");
            this._controllers['playtestLevel'] = this._gui.add(this, 'playtestLevel').name("START");

			// DROP DOWN FOR ASSET LEVELS
			var url = ChuClone.utils.getCWD() + "assets/levels/index.php";
            var request = new XMLHttpRequest();
			request.onreadystatechange = function() {
				if (request.readyState == 4) {
					var levelList = request.responseText.split("\n");
					levelList.pop();

					that._controllers['level'] = that._gui.add(that, '_prebuiltLevels');
					that._controllers['level'].options.apply(that._controllers['level'], levelList);
					that._controllers['level'].onChange(function()
					{
						var selected = this.domElement.childNodes[1].selectedIndex;
						 that.loadLevelFromURL( ChuClone.editor.WorldEditor.getInstance().getWorldController(),
								 ChuClone.editor.WorldEditor.getInstance().getViewController(),
								 "assets/levels/" + levelList[selected] + "?r"+Math.floor(Math.random() * 9999) );
						// Remove focus from the element otherwise it interferes with the kb
                		document.getElementsByTagName("canvas")[0].focus();
					});
                    that._controllers['level'].name("LEVELS DIR");

					that._gui.close();
					that._gui.open();
				}
			};
            request.open("GET", url );
            request.send(null);

//
//            this.domElement = document.createElement( 'div' );
//            this.domElement.style.position = "absolute";
//            this.domElement.style.position = "absolute";
//
//            this.domElement.style.fontFamily = 'Helvetica, Arial, sans-serif';
//            this.domElement.style.textAlign = 'left';
//            this.domElement.style.fontSize = '9px';
//            this.domElement.style.padding = '2px 0px 3px 0px';
//            this.domElement.innerHTML = "ABC1234123123";
//            document.body.appendChild( this.domElement );
        },

        /**
         * Loads the last level saved
         */
        loadLatestLevel: function() {
            try {
				this._currentSlot = parseInt(localStorage.getItem("lastSlot"));
                this.loadLevelFromSlot(null, null);
            } catch (error) {
                console.warn("LevelManager.loadLatestLevel - Load failed", error)
            }
        },



        /**
         * Saves the current level a save slot from HTML5 local storage
		 * @param {ChuClone.physics.WorldController} aWorldController
         */
        saveLevelToSlot: function( aWorldController) {

			// No worldcontroller specified - grab from editor but if there's no editor, let fail loudly
			if( !aWorldController) {
				aWorldController = ChuClone.editor.WorldEditor.getInstance().getWorldController();
			}

			var confirm = window.confirm("Save will overwrite existin data.\nAre you sure?");
			if(!confirm)
				return;

            var model = new ChuClone.editor.LevelModel();
            var data = model.parseLevel( aWorldController, this._currentName );
            var slot = "slot"+this._currentSlot;

            localStorage.setItem(slot, data);
            localStorage.setItem("lastSlot", this._currentSlot);

            this.saveLevelToServer(model);
            this._levelModel = model;
        },

		/**
		 * Saves a level to levels/local
		 */
		saveLevelToServer: function(model) {
			console.log( model );
			var url = ChuClone.utils.getCWD() + ChuClone.model.Constants.EDITOR.PATH_SERVER_LOCAL_SAVE;

			/**
			 * @s
			 */
			var formData = new FormData();
			formData.append("data", model.levelJSONString);
			formData.append("levelName", model.levelName);

			var request = new XMLHttpRequest();
			var that = this;
			request.onreadystatechange = function() {
				if( request.readyState == 4 ) {
                    console.log(request.responseText);
                }

				console.log(request.readyState)
			};

			request.open("POST", url);
			request.send( formData );
		},

        /**
         * Loads the level at the '_currentSlot'
         * Will call 'loadLevelFromJSONString'
		 * @param {ChuClone.physics.WorldController} aWorldController
		 * @param {ChuClone.GameViewController}	gameViewController
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
		 * @param {ChuClone.physics.WorldController} aWorldController
		 * @param {ChuClone.GameViewController}	gameViewController
         * @param {String} aURL
         */
        loadLevelFromURL: function( aWorldController, gameViewController, aURL ) {
            this.clearLevel(  aWorldController, gameViewController );

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
		 * @param {ChuClone.physics.WorldController} aWorldController
		 * @param {ChuClone.GameViewController}	gameViewController
         * @param {String} JSONString
         * @return {ChuClone.editor.LevelModel}
         */
        loadLevelFromJSONString: function( aWorldController, gameViewController, JSONString ) {
            var model = new ChuClone.editor.LevelModel();
            model.fromJsonString( JSONString, aWorldController, gameViewController);

            if( this._controllers.hasOwnProperty('name') ) {
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
			var confirm = window.confirm("Clear all level data?");
			if(!confirm) return;

            this.clearLevel( ChuClone.editor.WorldEditor.getInstance().getWorldController(), ChuClone.editor.WorldEditor.getInstance().getViewController() );
        },

        pasteLevel: function() {
            var pastedText = window.prompt("PasteLevel:");
            try {

                this.loadLevelFromJSONString( ChuClone.editor.WorldEditor.getInstance().getWorldController(), ChuClone.editor.WorldEditor.getInstance().getViewController(), pastedText );
            } catch( e ) {
                console.error(e);
            }
        },

        /**
         * Clears the level and dispatches the recreate event
         */
        playtestLevel: function() {
            /**
             * @type {ChuClone.model.FSM.StateMachine}
             */
            var FSM = ChuClone.model.FSM.StateMachine.getInstance();
            if( FSM._currentState instanceof ChuClone.states.PlayLevelState ) {
                FSM.gotoPreviousState();
                this._controllers['playtestLevel'].name("START");
                return
            }

            var playLevelState = new ChuClone.states.PlayLevelState( this._world);
            playLevelState._gameView = ChuClone.editor.WorldEditor.getInstance().getViewController();
            playLevelState._worldController = ChuClone.editor.WorldEditor.getInstance().getWorldController();
            FSM.changeState( playLevelState );

            this._controllers['playtestLevel'].name("STOP");
        },

        /**
         * Clears a level
		 * @param {ChuClone.physics.WorldController} aWorldController The WorldController instance that will be cleared
		 * @param {ChuClone.GameViewController}	gameViewController
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