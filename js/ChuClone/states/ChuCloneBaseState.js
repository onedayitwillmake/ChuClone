/**
File:
	ChuCloneBaseState.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	An abstract class for the all states specific to ChuClone.
 	Contains update physics and a few properties
 Basic Usage:
 	Should not be instantiated
 License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    "use strict";

	ChuClone.namespace("ChuClone.states");

	ChuClone.states.ChuCloneBaseState = function() {
		ChuClone.states.ChuCloneBaseState.superclass.constructor.call(this);
		this._gameView = null;
		this._worldController = null;
		this._levelManager = null;
	};

	ChuClone.states.ChuCloneBaseState.prototype = {
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
		 * @inheritDoc
		 */
		enter: function() {

			if( !this._levelManager || !this._worldController || !this._gameView ) {
				debugger;
			}

			ChuClone.states.ChuCloneBaseState.superclass.enter.call(this);
            this.setupEvents();
		},

		/**
		 * Sets up events this state wants to listen for
		 */
        setupEvents: function() {
            console.log("setting up events")
        },

        /**
         * @inheritDoc
         */
        update: function() {
            ChuClone.states.ChuCloneBaseState.superclass.update.call(this);
        },

		/**
		 * Updates the physics simulation
		 */
		updatePhysics: function() {
			var fixedTimeStepAccumulatorRatio = this._worldController.getFixedTimestepAccumulatorRatio();

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
                    entity.update( fixedTimeStepAccumulatorRatio );
            }
		},

        /**
         * @inheritDoc
         */
        exit: function() {
            ChuClone.states.ChuCloneBaseState.superclass.exit.call(this);
            this.dealloc();
        },

        /**
         * @inheritDoc
         */
        dealloc: function() {
			this._gameView = null;
			this._worldController = null;
			this._levelManager = null;
        }
	};

    ChuClone.extend( ChuClone.states.ChuCloneBaseState, ChuClone.model.FSM.State );
})();