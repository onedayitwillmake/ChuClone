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
         * @type {ChuClone.GameEntity}
         */
        _player         : null,

		/**
		 * @inheritDoc
		 */
		enter: function() {
			ChuClone.states.EditState.superclass.enter.call(this);


			this._worldController.setDebugDraw();

			var that = this;

			// Waiting for stuff to be ready hack - there's a bug in DAT.GUI if you try to set it up too early in the page load
			setTimeout(function(){
				that._worldController.setupEditor( that._gameView );
				that._levelManager.setupGui();
			}, 100);
		},

        setupEvents: function() {
            var that = this;
            var dispatch = ChuClone.Events.Dispatcher;

			// Listen for PLAYER created/destroyed
            this.addListener(ChuClone.components.player.CharacterControllerComponent.prototype.EVENTS.CREATED, function( aPlayer ) { that.onPlayerCreated(aPlayer); });
            this.addListener(ChuClone.components.player.CharacterControllerComponent.prototype.EVENTS.REMOVED, function( aPlayer ) { that.onPlayerDestroyed(aPlayer); });

			// Listen for LEVEL created/destroyed
            this.addListener(ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_CREATED, function( aLevelManager ) { that.onLevelCreated( aLevelManager ); });
            this.addListener(ChuClone.editor.LevelManager.prototype.EVENTS.LEVEL_DESTROYED, function( aLevelManager ) { that.onLevelDestroyed( aLevelManager); });
        },

        /**
         * @inheritDoc
         */
        update: function() {
            ChuClone.states.EditState.superclass.update.call(this);
			this.updatePhysics();
            this._worldController.update();
            this._gameView.update( Date.now() );
        },

        /**
         * @inheritDoc
         */
        exit: function() {
            ChuClone.states.EditState.superclass.exit.call(this);
        },

        /**
		 * Called when a player is created
		 * @param aPlayer
		 */
		onPlayerCreated: function( aPlayer ) {
			console.log("ChuCloneGame.onPlayerCreated:", aPlayer);
		},

		/**
		 * Called when a player is destroyed
		 * @param {ChuClone.GameEntity} aPlayer
		 */
		onPlayerDestroyed: function( aPlayer ) {
			console.log("ChuCloneGame.onPlayerDestroyed:", aPlayer);
		},

		/**
		 * Called when a level has been created/loaded
		 * @param {ChuClone.editor.LevelManager} aLevelManager
		 */
		onLevelCreated: function( aLevelManager ) {
			this._worldController.createBox2dWorld();
			console.log("ChuCloneGame.onLevelCreated:", aLevelManager);
		},

		onLevelDestroyed: function( aLevelManager ) {
			console.log("ChuCloneGame.onLevelDestroyed:", aLevelManager);
			this._gameView.getCamera().removeAllComponents();
			this._worldController.createBox2dWorld();
		},

        /**
         * @inheritDoc
         */
        dealloc: function() {
			ChuClone.states.EditState.dealloc.exit.call(this);
			this._player = null;
        }
	};

    ChuClone.extend( ChuClone.states.EditState, ChuClone.states.ChuCloneBaseState );
})();