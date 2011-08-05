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
(function() {
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
		_levelModel		 : null,

		/**
		 * @type {Object}
		 */
		_controllers		: {},

		/**
		 * @type {Number} Current HTML5 local storage save slot
		 */
		_currentSlot		: 0,

		/**
		 * Level name according to DAT.GUI field - is used when modifying/saving levels
		 */
		_currentName		: "Untitled",

		/**
		 * Not actually a number, but that's what DAT.GUI wants for a drop down list
		 * @type {Number}
		 */
		_userLevels			: 0,
		/**
		 * @type {Object}
		 */
		_userLevelList		: {},


		EVENTS			  : {
			LEVEL_CREATED   : "LevelManager.Events.WorldCreated",
			LEVEL_DESTROYED : "LevelManager.Events.LevelDestroyed"
		},

		setupGui: function() {
			var that = this;
			// Creation gui
			this._gui = new DAT.GUI({width: ChuClone.model.Constants.EDITOR.PANEL_WIDTH + 50});
			this._gui.name("LevelManager");
			this._gui.autoListen = false;

			this._controllers['name'] = this._gui.add(this, '_currentName').name("Level Name").onFinishChange(function( newValue ) {
				document.getElementById("levelName").innerText = newValue
			});

			// Create a save slot control
			this._controllers['slot'] = this._gui.add(this, '_currentSlot').options([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).name("Active Save Slot");
			var slotIndex = parseInt(localStorage.getItem("lastSlot"));
			this._controllers['slot'].domElement.childNodes[1].selectedIndex = slotIndex;
			this._controllers['slot'].setValue(slotIndex);
			// Local Save
			this._controllers['saveLevelToSlot'] = this._gui.add(this, 'saveLevelToSlot').name("Save To Slot");
			// Local Load
			this._controllers['loadLevelFromSlot'] = this._gui.add(this, 'loadLevelFromSlot').name("Load From Slot");
			// Server Save
			this._controllers['saveToServer'] = this._gui.add(this, 'onShouldSaveToServer').name("Save To Server");

			/**
			 * Creates the Load From Server drop down
			 */
			that._controllers['level'] = that._gui.add(that, '_userLevels');
			that._controllers['level'].options([]);
			that._controllers['level'].onChange(function() {
				var selected = this.domElement.childNodes[1].selectedIndex;
				that.onLevelDropDownItemSelected(selected);
			});
			that._controllers['level'].name("Load From Server");
			this.loadServerLeveList();

		},

		/**
		 * Sets up the drop down list that displays this users levels
		 */
		loadServerLeveList: function() {
			var that = this;
			var request = new XMLHttpRequest();
			request.onreadystatechange = function() {
				if (request.readyState == 4) {
					that.populateServerLevelList(request);
				}
			};
			request.open("GET", ChuClone.model.Constants.SERVER.USER_LEVELS_LOCATION);
			request.send(null);
		},

		/**
		 * Called once the level list has been loaded
		 * @param request
		 */
		populateServerLevelList: function(request) {
			var that = this;
			var levelListing = JSON.parse(request.responseText);

			ChuClone.utils.repopulateOptionsGUI(this._controllers['level'], levelListing, function(aSelectOption, myData, index) {
				aSelectOption.value = myData.level.id;
				aSelectOption.innerText = myData.level.title;
				aSelectOption.label = myData.level.title;
			});

			that._gui.close();
			that._gui.open();
		},

		/**
		 * Called when an item from the level dropdown list has been selected
		 * @param {Number} selectedIndex
		 */
		onLevelDropDownItemSelected: function(selectedIndex) {

			// Retrieve the id using the drop down list item's name, which is mapped to an object that stored the server id's
			// for each item - mapped to the title
			var itemValue = this._controllers['level'].domElement.lastChild.children[selectedIndex].value;

			var worldController = ChuClone.editor.WorldEditor.getInstance().getWorldController();
			var aWorldEditor = ChuClone.editor.WorldEditor.getInstance().getViewController();
			var aURL = ChuClone.model.Constants.SERVER.LEVEL_LOAD_LOCATION + itemValue + ".js?r" + Math.floor(Math.random() * 9999);
			this.loadLevelFromURL(worldController, aWorldEditor, aURL);

//				Remove focus from the element otherwise it interferes with the kb
			document.getElementsByTagName("canvas")[0].focus();
		},

		/**
		 * Loads the last level saved
		 */
		loadLatestLevel: function() {
			try {
				this._currentSlot = parseInt(localStorage.getItem("lastSlot"));
				this.loadLevelFromSlot(null, null);
			} catch (error) {
				ChuClone.utils.displayFlash("LevelManager.loadLatestLevel - Load failed", 0);
			}
		},



		/**
		 * Saves the current level a save slot from HTML5 local storage
		 * @param {ChuClone.physics.WorldController} aWorldController
		 */
		saveLevelToSlot: function(aWorldController) {

			// No worldcontroller specified - grab from editor but if there's no editor, let fail loudly
			if (!aWorldController) {
				aWorldController = ChuClone.editor.WorldEditor.getInstance().getWorldController();
			}

			var confirm = window.confirm("Save will overwrite existin data.\nAre you sure?");
			if (!confirm) {
				return;
			}

			var model = new ChuClone.editor.LevelModel();
			var data = model.parseLevel(aWorldController, this._currentName);
			var slot = "slot" + this._currentSlot;

			localStorage.setItem(slot, data);
			localStorage.setItem("lastSlot", this._currentSlot);


			ChuClone.utils.displayFlash("Level Saved at slot:" + slot, 1);
			this._levelModel = model;
		},

		/**
		 * Saves a level to levels/local
		 */
		onShouldSaveToServer: function() {

			var confirm = window.confirm("No take backs!\nAre you sure?");
			if (!confirm) {
				return;
			}

			// Place player at inital respawn point
			ChuClone.editor.WorldEditor.getInstance()._guiPlayer.restartPlayer();

			var model = new ChuClone.editor.LevelModel();
			var data = model.parseLevel(ChuClone.editor.WorldEditor.getInstance().getWorldController(), this._currentName);

//			console.log(model.levelJSONString)
			// Using window['FormData'] for now because intelli-j doesn't recognize FormData as a HTML5 object
			var formData = new window['FormData']();
			formData.append("level_json", model.levelJSONString);
			formData.append("levelName", model.levelName);

			var request = new XMLHttpRequest();
			var that = this;
			request.onreadystatechange = function() {
				if (request.readyState == 4) {

					// Invalid JSON returned - probably has validation errors
					try {
						var result = JSON.parse(request.responseText)[0];
					} catch (e) {
						ChuClone.utils.displayFlash( ChuClone.utils.getValidationErrors( request.responseText ), 0);
						return;
					}

					if (result.status == false) {
						ChuClone.utils.displayFlash( ChuClone.utils.getValidationErrorsFromJSON( result.notice ), 0);
					} else {
						ChuClone.utils.displayFlash("Save To Server Success:", 1);
					}
				}
			};

			request.open("POST", ChuClone.model.Constants.SERVER.USER_SUBMIT_LOCATION);
			request.send(formData);
		},

		/**
		 * Loads the level at the '_currentSlot'
		 * Will call 'loadLevelFromJSONString'
		 * @param {ChuClone.physics.WorldController} aWorldController
		 * @param {ChuClone.GameViewController}	gameViewController
		 */
		loadLevelFromSlot: function(aWorldController, gameViewController) {

			// No worldcontroller specified - grab from editor but if there's no editor, let fail loudly
			if (!aWorldController || gameViewController) {
				aWorldController = ChuClone.editor.WorldEditor.getInstance().getWorldController();
				gameViewController = ChuClone.editor.WorldEditor.getInstance().getViewController();
			}

			this.clearLevel(aWorldController, gameViewController);

			var slot = "slot" + this._currentSlot;
			var data = localStorage.getItem(slot);
			this.loadLevelFromJSONString(aWorldController, gameViewController, data);
		},

		/**
		 * Retrieves a level from a URL
		 * Will call 'loadLevelFromJSONString'
		 * @param {ChuClone.physics.WorldController} aWorldController
		 * @param {ChuClone.GameViewController}	gameViewController
		 * @param {String} aURL
		 */
		loadLevelFromURL: function(aWorldController, gameViewController, aURL) {
			this.clearLevel(aWorldController, gameViewController);

			var url = aURL;
			var request = new XMLHttpRequest();
			var that = this;
			request.onreadystatechange = function() {
				if (request.readyState == 4) {
					that.loadLevelFromJSONString(aWorldController, gameViewController, request.responseText);
				}
			};
			request.open("GET", url);
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
		loadLevelFromJSONString: function(aWorldController, gameViewController, JSONString) {
			var model = new ChuClone.editor.LevelModel();
			model.fromJsonString(JSONString, aWorldController, gameViewController);

			if (this._controllers.hasOwnProperty('name')) {

				// Set the current name, and emit the loaded event
				this._controllers['name'].setValue(model.levelName);
				document.getElementById("levelName").innerText = model.levelName
			}

			this._levelModel = model;
			ChuClone.Events.Dispatcher.emit(ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_CREATED, this);
			return model;
		},

		/**
		 * Clears the level and dispatches the recreate event
		 */
		playtestLevel: function() {
			/**
			 * @type {ChuClone.model.FSM.StateMachine}
			 */
			var FSM = ChuClone.model.FSM.StateMachine.getInstance();
			if (FSM._currentState instanceof ChuClone.states.PlayLevelState) {
				FSM.gotoPreviousState();
				this._controllers['playtestLevel'].name("PLAYTEST");
				return
			}

			var playLevelState = new ChuClone.states.PlayLevelState(this._world);
			playLevelState._gameView = ChuClone.editor.WorldEditor.getInstance().getViewController();
			playLevelState._worldController = ChuClone.editor.WorldEditor.getInstance().getWorldController();
			FSM.changeState(playLevelState);

			this._controllers['playtestLevel'].name("STOP");
		},

		/**
		 * Clears a level
		 * @param {ChuClone.physics.WorldController} aWorldController The WorldController instance that will be cleared
		 * @param {ChuClone.GameViewController}	gameViewController
		 */
		clearLevel: function(aWorldController, gameViewController) {

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

				if ("getView" in entity) {
					gameViewController.removeObjectFromScene(entity.getView());
				}

				if ("dealloc" in entity) {
					entity.dealloc();
				}

				aWorldController.getWorld().DestroyBody(b);
			}

            gameViewController.getCamera().removeAllComponents();
			ChuClone.Events.Dispatcher.emit(ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_DESTROYED, this);
		}


		///// ACCESSORS
	}
})();