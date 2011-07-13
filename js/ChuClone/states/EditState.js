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

	ChuClone.states.EditState = function() {
		ChuClone.states.EditState.superclass.constructor.call(this);
	};

	ChuClone.states.EditState.prototype = {
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
		 * @inheritDoc
		 */
		enter: function() {
			ChuClone.states.EditState.superclass.enter.call(this);
		},

        update: function() {
            ChuClone.states.EditState.superclass.update.call(this);

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

        exit: function() {
            ChuClone.states.EditState.superclass.exit.call(this);
        },

        dealloc: function() {

        }
	};

    ChuClone.extend( ChuClone.states.EditState, ChuClone.model.FSM.State );
})();