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
         * @type {ChuClone.PlayerEntity}
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
            this._gui = new DAT.GUI({width: ChuClone.Constants.EDITOR.PANEL_WIDTH});
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
            ChuClone.Events.Dispatcher.addListener(ChuClone.PlayerEntity.prototype.EVENTS.CREATED, function( aPlayer ) {
                that.destroyPlayer();
                that._player = aPlayer;
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

			var respawnPoint = this.getRespawnPoint();

			if( !respawnPoint ) {
				console.error("ChuClone.editor.PlayerGUI.createPlayer Create at least one RespawnComponent first!!");
				return null;
			}


			var body = worldEditor.getWorldController().createRect( 0, 0, 0, ChuClone.Constants.PLAYER.WIDTH, ChuClone.Constants.PLAYER.HEIGHT, false);
			var view = worldEditor.getViewController().createEntityView(0, 0, ChuClone.Constants.PLAYER.WIDTH, ChuClone.Constants.PLAYER.HEIGHT, ChuClone.Constants.PLAYER.DEPTH);

			var entity = new ChuClone.PlayerEntity();
			entity.setBody(body);
			entity.setView(view);

			body.SetPosition(new Box2D.Common.Math.b2Vec2( respawnPoint.getBody().GetPosition().x, respawnPoint.getBody().GetPosition().y - 1));
			view.materials[0] = ChuClone.Constants.PLAYER.MATERIAL;
			entity.setDimensions(ChuClone.Constants.PLAYER.WIDTH, ChuClone.Constants.PLAYER.HEIGHT, ChuClone.Constants.PLAYER.DEPTH);


			entity.addComponentAndExecute(new ChuClone.components.CharacterControllerComponent());
			entity.addComponentAndExecute(new ChuClone.components.PhysicsVelocityLimitComponent());

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
        },

		/**
		 * Resets the player object to the first respawn point
		 */
		resetPlayer: function() {
			if( !this._player ) {
				console.error("ChuClone.editor.PlayerGUI.resetPlayer - '_player' is null!");
				return null;
			}

			var respawnPoint = this.getRespawnPoint();
			if( !respawnPoint ) {
				console.error("ChuClone.editor.PlayerGUI.resetPlayer - Create at least one RespawnComponent first!");
				return null;
			}

			this._player.getBody().SetPosition(new Box2D.Common.Math.b2Vec2( respawnPoint.getBody().GetPosition().x, respawnPoint.getBody().GetPosition().y + 1));
        },

		/**
		 * Returns the first respawn point found
		 * // TODO: This method is returns the first found, not the nearest or any specific order
		 */
		getRespawnPoint: function() {
			/**
             * @type {Box2D.Dynamics.b2Body}
             */
            var node = ChuClone.editor.WorldEditor.getInstance().getWorldController().getWorld().GetBodyList();
            while(node) {
                var b = node;
                node = node.GetNext();
                /**
                 * @type {ChuClone.GameEntity}
                 */
                var entity = b.GetUserData();
				if( (entity instanceof ChuClone.GameEntity) === false )
					continue;

				var respawnComponent = entity.getComponentWithName( ChuClone.components.RespawnComponent.prototype.displayName )
				if( respawnComponent  ) {
					return entity;
				}
            }
		},

        /**
         * Deallocate resources
         */
        dealloc: function() {
            this._player = null;
        }
    }
})();