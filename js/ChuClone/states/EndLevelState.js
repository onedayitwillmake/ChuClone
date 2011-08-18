/**
File:
	CharacterControllerComponent.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	This component will allow an entity to be controlled as a 'character'
 Basic Usage:

 License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    "use strict";

	ChuClone.namespace("ChuClone.states");

	ChuClone.states.EndLevelState = function() {
		ChuClone.states.EndLevelState.superclass.constructor.call(this);
	};

	ChuClone.states.EndLevelState.prototype = {
        /**
         * @type {ChuClone.GameEntity}
         */
        _player         : null,

        /**
         * @type {Number}
         */
        _completionTime : 0,
        
        /**
         * @type {String}
         */
        _record         : null,

		/**
		 * @inheritDoc 
		 */
		enter: function() {
			ChuClone.states.EndLevelState.superclass.enter.call(this);

			var gameCamera = this._gameView.getCamera();
			gameCamera.removeAllComponents();

			// Let's find the radius of the level
			 var node = this._worldController.getWorld().GetBodyList();
            while(node) {
                var b = node;
                node = node.GetNext();
			}

			// Allow rotation about target
			var focusComponent = new ChuClone.components.camera.CameraOrbitRadiusComponent();
			focusComponent.setTarget( this._player.getView().position );
			focusComponent.getRadius().x = 4000;
			focusComponent.getRadius().y = 2000;
			focusComponent.getRadius().z = 4000;
			gameCamera.addComponentAndExecute(focusComponent);

			this._player.removeComponentWithName( ChuClone.components.player.CharacterControllerComponent.prototype.displayName  );
		},

		/**
		 * @inheritDoc
		 */
        setupEvents: function() {
			var that = this;

            this.addListener( ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_DESTROYED, function( aLevelManager ) {
				//that.onLevelDestroyed( aLevelManager )
				console.log("EndLevelState >> LeveLDestroyed!");
				ChuClone.gui.LevelRecap.destroy();
				that._gameView.getCamera().removeComponentWithName( ChuClone.components.camera.CameraFocusRadiusComponent.prototype.displayName );

				/**
				 * @type {ChuClone.states.PlayLevelState}
				 */
				var playLevelState = new ChuClone.states.PlayLevelState();
				playLevelState._gameView = that._gameView;
				playLevelState._worldController = that._worldController;
				playLevelState._levelManager = that._levelManager;
				ChuClone.model.FSM.StateMachine.getInstance().changeState(playLevelState);
			} );
		},

        /**
         * @inheritDoc
         */
        update: function() {
            ChuClone.states.EndLevelState.superclass.update.call(this);

            this.updatePhysics();
            this._worldController.update();
            this._gameView.update( Date.now() );
        },


		/**
		 * Submits a score for this run
		 */
        submitScore: function() {
            var request = new XMLHttpRequest();
			var that = this;

            // Using window['FormData'] for now because intelli-j doesn't recognize FormData as a HTML5 object
			var formData = new window['FormData']();
			formData.append("score", this._completionTime);
			formData.append("record", this._record);

			request.onreadystatechange = function() {
				if (request.readyState == 4) {

					ChuClone.gui.LevelRecap.show( that._completionTime, that._levelManager.getModel().levelName );

					// Invalid JSON returned - probably has validation errors
					try {
						var result = JSON.parse(request.responseText)[0];
					} catch (e) {
						ChuClone.utils.displayFlash( ChuClone.utils.getValidationErrors( request.responseText ), 0);
						return;
					}

					if (result.status == false) {
						ChuClone.utils.displayFlash( result.notice + " - Score not saved", 0);
					} else {
						ChuClone.utils.displayFlash("Highscore Saved", 1);
					}


				}
			};


            var scoreurl = ChuClone.model.Constants.SERVER.SCORE_SUBMIT_LOCATION.replace("#", window.location.href.match(/[\/](\d+)/)[1]);
			request.open("POST", scoreurl);
			request.send(formData);
        },


        /**
         * @inheritDoc
         */
        exit: function() {
            ChuClone.states.EndLevelState.superclass.exit.call(this);
        },

        /**
         * @inheritDoc
         */
        dealloc: function() {
			ChuClone.states.EndLevelState.superclass.dealloc.call(this);
			this._player = null;
        },

		///// ACCESSORS
		/**
		 * Sets the current _playerEntity
		 * @param {ChuClone.GameEntity} aPlayer
		 */
		setPlayer: function( aPlayer ) {
			this._player = aPlayer;
            this._player.addComponentAndExecute( new ChuClone.components.effect.BirdEmitterComponent() );
		},

        /**
         * @param {String}
         */
        setTime: function(aTime) {
            this._completionTime = aTime;
        },

        /**
         * @param {String}
         */
        setRecord: function( aRecord ) {
            if( !aRecord ) {
                return
            }
            this._record = aRecord;
            this.submitScore();
        }
	};

    ChuClone.extend( ChuClone.states.EndLevelState, ChuClone.states.ChuCloneBaseState );
})();