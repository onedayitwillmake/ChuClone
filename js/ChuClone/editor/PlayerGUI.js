/**
 File:
    PlayerGUI.js
 Created By:
    Mario Gonzalez - mariogonzalez@gmail.com
 Project:
    ChuClone
 Abstract:
    This class is just a singleton proxy for an event emitter instnace
 Basic Usage:
     // Assumes all files are loaded
    var game = new ChuClone.ChuCloneGame();
 Version:
    1.0

 License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    "use strict";
    ChuClone.namespace("ChuClone.editor.PlayerGUI");
    ChuClone.editor.PlayerGUI = function() {


//		var playa;
//		ChuClone.editor.PlayerGUI.prototype.__defineGetter__("_player", function() {
//			debugger;
//			return playa;
//		});
//		ChuClone.editor.PlayerGUI.prototype.__defineSetter__("_player", function(y) {
//			debugger;
//			playa = y;
//		});
		this.setupEvents();
        this.setupGUI()
    };

    ChuClone.editor.PlayerGUI.prototype = {
        /**
         * @type {ChuClone.GameEntity}
         */
        _player: null,


        /**
         * @type {DAT.GUI}
         */
        _gui    : null,
        
        /**
         * @type {Array}
         */
        _controls: [],

        setupGUI: function() {
            var that = this;
            this._gui = new DAT.GUI({width: ChuClone.model.Constants.EDITOR.PANEL_WIDTH});
            this._gui.name("Player");
            this._gui.autoListen = false;

            this._controls['Create'] = this._gui.add(this, 'createPlayer').name("Create");
            this._controls['Destroy'] = this._gui.add(this, 'destroyPlayer').name("Destroy");
            this._controls['Reset'] = this._gui.add(this, 'resetPlayer').name("Reset");
			this._gui.close();
			this._gui.open();
        },


		/**
		 * Setup events
		 */
        setupEvents: function() {
            var that = this;
            ChuClone.Events.Dispatcher.addListener(ChuClone.components.CharacterControllerComponent.prototype.EVENTS.CREATED, function( aPlayer ) {
                that.destroyPlayer();
                that._player = aPlayer;
            });

			ChuClone.Events.Dispatcher.addListener(ChuClone.components.CharacterControllerComponent.prototype.EVENTS.REMOVED, function( aPlayer ) {
				if( aPlayer == that._player )
					that._player = null;
            });
        },

		/**
		 * Creates a player instance.
		 * This function should only be called while editing.
		 */
        createPlayer: function() {
			/**
			 * @type {ChuClone.editor.WorldEditor}
			 */
			var worldEditor = ChuClone.editor.WorldEditor.getInstance();

			if( !worldEditor ) {
				console.error("ChuClone.editor.PlayerGUI.createPlayer should only be called in editing mode!");
				return null;
			}

			var respawnPoint = ChuClone.components.RespawnComponent.prototype.GET_CURRENT_RESPAWNPOINT();
			if( !respawnPoint ) {
				console.error("ChuClone.editor.PlayerGUI.createPlayer Create at least one RespawnComponent first!!");
				ChuClone.utils.displayFlash("Cannot create player.<br>Create at least one RespawnComponent first!!", 0);
				return null;
			}


			var body = worldEditor.getWorldController().createRect( 0, 0, 0, ChuClone.model.Constants.PLAYER.WIDTH, ChuClone.model.Constants.PLAYER.HEIGHT, false);
			var view = worldEditor.getViewController().createEntityView(0, 0, ChuClone.model.Constants.PLAYER.WIDTH, ChuClone.model.Constants.PLAYER.HEIGHT, ChuClone.model.Constants.PLAYER.DEPTH);

			var entity = new ChuClone.GameEntity();
			entity.setBody(body);
			entity.setView(view);

			body.SetPosition(new Box2D.Common.Math.b2Vec2( respawnPoint.attachedEntity.getBody().GetPosition().x, respawnPoint.attachedEntity.getBody().GetPosition().y - 1));
			view.materials[0] = ChuClone.model.Constants.PLAYER.MATERIAL;
			entity.setDimensions(ChuClone.model.Constants.PLAYER.WIDTH, ChuClone.model.Constants.PLAYER.HEIGHT, ChuClone.model.Constants.PLAYER.DEPTH);


			entity.addComponentAndExecute(new ChuClone.components.CharacterControllerComponent());
			entity.addComponentAndExecute(new ChuClone.components.PhysicsVelocityLimitComponent());
			entity.addComponentAndExecute(new ChuClone.components.BoundsYCheckComponent());

			worldEditor.getViewController().addObjectToScene(entity.view);
        },

		/**
		 * Destroys the current player instance
		 */
        destroyPlayer: function() {
            if( !this._player )
                return;

            ChuClone.editor.WorldEditor.getInstance().getViewController().removeObjectFromScene( this._player.getView() );

            // Store ref to body, and deallocate player
            var playerbody = this._player.getBody();
            this._player.dealloc();
            ChuClone.editor.WorldEditor.getInstance().getWorldController().getWorld().DestroyBody( playerbody );

			this._player = null;
        },

		/**
		 * Resets the player object to the last respawn point
		 */
		resetPlayer: function() {
			if( !this._player ) {
				ChuClone.utils.displayFlash("ChuClone.editor.PlayerGUI.resetPlayer<br>There is no player!!", 0);
				return null;
			}

			var respawnPoint = ChuClone.components.RespawnComponent.prototype.GET_CURRENT_RESPAWNPOINT();
			if( !respawnPoint ) {
				ChuClone.utils.displayFlash("ChuClone.editor.PlayerGUI.resetPlayer<br>Create at least one RespawnComponent first!", 0);
				console.error("resetPlayer failed<br>Create at least one RespawnComponent first!");
				return null;
			}

			this._player.getBody().SetPosition(new Box2D.Common.Math.b2Vec2( respawnPoint.attachedEntity.getBody().GetPosition().x, respawnPoint.attachedEntity.getBody().GetPosition().y - 1));
        },

		/**
		 * Resets the player object to the first respawn point
		 */
		restartPlayer: function() {
			if( !this._player ) {
				ChuClone.utils.displayFlash("There is no player!", 0);
				return null;
			}

			var respawnPoint = ChuClone.components.RespawnComponent.prototype.GET_ALL_RESPAWNPOINTS()[0];
			if( !respawnPoint ) {
				ChuClone.utils.displayFlash("restartPlayer failed<br>Create at least one RespawnComponent first!", 0);
				return null;
			}

			this._player.getBody().SetPosition(new Box2D.Common.Math.b2Vec2( respawnPoint.attachedEntity.getBody().GetPosition().x, respawnPoint.attachedEntity.getBody().GetPosition().y - 1));
        },

        /**
         * Deallocate resources
         */
        dealloc: function() {
            this._player = null;
        }
    }
})();