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
		 * Called when a goal is hit
		 * @param {ChuClone.components.GoalPadComponent} aGoalComponent
		 */
		onGoalReached: function( aGoalComponent ) {
			console.log("ChuClone.states.EndLevelState:", aGoalComponent);

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
		}
	};

    ChuClone.extend( ChuClone.states.EndLevelState, ChuClone.model.FSM.State );
})();