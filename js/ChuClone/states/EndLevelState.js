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
         * @type {ChuClone.GameViewController}
         */
        _gameView: null,

        /**
         * @type {ChuClone.physics.WorldController}
         */
        _worldController: null,

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
            this._gameView.getCamera().removeAllComponents();
            this.setupEvents();
		},

        setupEvents: function() {
            console.log("setting up events")
        },

        /**
         * @inheritDoc
         */
        update: function() {
            ChuClone.states.EndLevelState.superclass.update.call(this);

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
        },

        /**
         * @inheritDoc
         */
        exit: function() {
            ChuClone.states.EndLevelState.superclass.exit.call(this);
            this.dealloc();
        },

        /**
         * @inheritDoc
         */
        dealloc: function() {
			this._gameView = null;
			this._player = null;
			this._worldController = null;
        },

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
        },

        submitScore: function() {
            var request = new XMLHttpRequest();
			var that = this;

            // Using window['FormData'] for now because intelli-j doesn't recognize FormData as a HTML5 object
			var formData = new window['FormData']();
			formData.append("score", this._completionTime);
			formData.append("record", this._record);

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

            
            var scoreurl = ChuClone.model.Constants.SERVER.SCORE_SUBMIT_LOCATION.replace("#", window.location.href.match(/[\/](\d+)/)[1]);
			request.open("POST", scoreurl);
			request.send(formData);
        }
	};

    ChuClone.extend( ChuClone.states.EndLevelState, ChuClone.model.FSM.State );
})();