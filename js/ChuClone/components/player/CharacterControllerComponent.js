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
    
	ChuClone.namespace("ChuClone.components.player");

	ChuClone.components.player.CharacterControllerComponent = function() {
		ChuClone.components.player.CharacterControllerComponent.superclass.constructor.call(this);
        this.requiresUpdate = true;
	};

	ChuClone.components.player.CharacterControllerComponent.prototype = {
        /**
         * @type {String}
         */
		displayName			: "CharacterControllerComponent",					// Unique string name for this Trait

        /**
         * @type {Number}
         */
        _moveSpeed			: new Box2D.Common.Math.b2Vec2(0.009, 0.15),

		/**
		 * Object containing events we can dispatch
		 */
		EVENTS	: {
            CREATED: "PlayerEntity.event.created",
            REMOVED: "PlayerEntity.event.removed"
        },
		/**
		 * Collision Group
		 * @type {Number}
		 */
		GROUP   : -1,
		_type	: ChuClone.model.Constants.ENTITY_TYPES.PLAYER,

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.player.CharacterControllerComponent.superclass.attach.call(this, anEntity);

			this.intercept(['_type', 'onCollision']);
			//this.attachedEntity.getBody().SetBullet( true );

            // Attach a RemoteJoystickInput or KeyboardInput controller
			if( ChuClone.model.Constants.JOYSTICK.ENABLED ) this._input = new ChuClone.components.player.RemoteJoystickInputComponent();
			else this._input = new ChuClone.components.player.KeyboardInputComponent ();
            this.attachedEntity.addComponentAndExecute( this._input );


            // Attach sensor to check if jumping
            this._jumpCheckComponent = new ChuClone.components.player.CheckIsJumpingComponent();
            this.attachedEntity.addComponentAndExecute( this._jumpCheckComponent );

			// Attach boundsY check component
            this.attachedEntity.addComponentAndExecute( new ChuClone.components.BoundsYCheckComponent() );

			// Attach physics velocity limit component
			this.attachedEntity.addComponentAndExecute(new ChuClone.components.PhysicsVelocityLimitComponent());

			//ChuClone.components.portal.PortalGunComponent
			var levelModel = ChuClone.editor.LevelManager.getInstance().getModel();

			// Set collisionfiltering
			this.setFilterData( this.attachedEntity.getBody() );

			if( levelModel.allowsPortalGun() ) {
				var portalGunComponent = new ChuClone.components.portal.PortalGunComponent();
				portalGunComponent.setGameView( ChuClone.GameViewController.INSTANCE );
				portalGunComponent.setWorldController( ChuClone.model.Constants.PHYSICS.CONTROLLER );
				this.attachedEntity.addComponentAndExecute( portalGunComponent );
			}


			// Swap materials
			var view = this.attachedEntity.getView();
            this._previousMaterial = view.materials[0];
            view.materials[0] = new THREE.MeshLambertMaterial( {
                color: 0xFFFFFF, shading: THREE.SmoothShading,
                map : ChuClone.utils.TextureUtils.GET_TEXTURE( ChuClone.model.Constants.SERVER.ASSET_PREFIX + "assets/images/game/crate.png" )
            });

			this.dispatchCreatedEvent();
		},

		/**
		 * @inheritDoc
		 */
        update: function() {
            var force = new Box2D.Common.Math.b2Vec2(0, 0);
            var PTM_RATIO = ChuClone.model.Constants.PTM_RATIO;
            var body = this.attachedEntity.getBody();

            // x-axis
            if (this._input._keyStates.left) { force.x = -1; }
            else if (this._input._keyStates.right) { force.x = 1;}

            // y-axis
            if (this._input._keyStates.up && this._jumpCheckComponent._canJump) {
                force.y = -1;
                this._jumpCheckComponent._canJump = false;
				ChuClone.model.AchievementTracker.getInstance().startTrackingJump();

            } else if (this._input._keyStates.down && this._jumpCheckComponent._canApplyDownwardForce) {
				if( body.GetLinearVelocity().y < (PTM_RATIO/2 - 2)/2 ) {
					force.y = 0.25;
				}
			}

			// Apply force
            var bodyPosition = body.GetWorldCenter();
            var impulse = new Box2D.Common.Math.b2Vec2(this._moveSpeed.x * PTM_RATIO * body.GetMass() * force.x, this._moveSpeed.y * PTM_RATIO * body.GetMass() * force.y);
            body.ApplyImpulse(impulse, bodyPosition);
        },

		onCollision: function( otherActor ) {

			//var now = Date.now();
			//var then = this.attachedEntity._rememberedVelocity.time;
			//var delta = now - then;
			//if( delta < 16 ) {
			//	//console.log("MinDelta");
			//}
			//
			//this.attachedEntity._rememberedVelocity.time = now;

			var playerSpeed = Math.abs(this.attachedEntity.getBody().GetLinearVelocity().x) + Math.abs(this.attachedEntity.getBody().GetLinearVelocity().y);
			//console.log("CharSpeed:", playerSpeed);
			this.interceptedProperties.onCollision.call(this.attachedEntity, otherActor);
		},

		/**
         * Dispatches the created event via timeout so that it can be called the "next frame"
         */
        dispatchCreatedEvent: function() {
            var that = this;
            ChuClone.utils.FunctionQueue.setTimeout(function(){
                ChuClone.Events.Dispatcher.emit( ChuClone.components.player.CharacterControllerComponent.prototype.EVENTS.CREATED, that.attachedEntity);
            }, 1);
        },

		/**
         * @inheritDoc
         */
        setBody: function( aBody ) {
			this.interceptedProperties['setBody'].call( this.attachedEntity, aBody );
			this.setFilterData( aBody )
            //aBody.GetFixtureList().m_filter.groupIndex = ChuClone.components.player.CharacterControllerComponent.prototype.GROUP;
        },

		/**
		 * Sets the collision filter data for our body to colide against world objects
		 * @param {Box2D.Dynamics.b2Body} aBody
		 */
		setFilterData: function( aBody ) {
			var filter = new Box2D.Dynamics.b2FilterData();

			for (var fixture = aBody.m_fixtureList; fixture;) {
				filter.categoryBits = ChuClone.model.Constants.PHYSICS.COLLISION_CATEGORY.PLAYER;
				filter.maskBits = ChuClone.model.Constants.PHYSICS.COLLISION_CATEGORY.WORLD_OBJECT;
				filter.groupIndex = ChuClone.model.Constants.PHYSICS.COLLISION_GROUP.PLAYER;
				fixture.SetFilterData(filter);

				// next
				fixture = fixture.m_next;
			 }
		},

        /**
         * Restore material and restitution
         */
        detach: function() {
            // remove input component
            this.attachedEntity.removeComponentWithName( ChuClone.components.player.KeyboardInputComponent.prototype.displayName );

			// Remove RemoteJoystick if joystick is enabled
			if( ChuClone.model.Constants.JOYSTICK.ENABLED ) this.attachedEntity.removeComponentWithName( ChuClone.components.player.RemoteJoystickInputComponent.prototype.displayName );

            this._input = null;
            this._jumpCheckComponent = null;

			ChuClone.Events.Dispatcher.emit( ChuClone.components.player.CharacterControllerComponent.prototype.EVENTS.REMOVED, this.attachedEntity);
            ChuClone.components.player.CharacterControllerComponent.superclass.detach.call(this);
        }
	};

	/**
	 * Creates a character at a given respawn point
	 * @param {ChuClone.components.RespawnComponent} respawnPoint
	 * @param {ChuClone.GameViewController} gameViewController
	 * @param {ChuClone.physics.WorldController} worldController
	 */
	ChuClone.components.player.CharacterControllerComponent.CREATE = function(respawnPoint, gameViewController, worldController) {
		// Create a body and a view object
		var body = worldController.createRect(0, 0, 0, ChuClone.model.Constants.PLAYER.WIDTH, ChuClone.model.Constants.PLAYER.HEIGHT, false);
		var view = gameViewController.createEntityView(0, 0, ChuClone.model.Constants.PLAYER.WIDTH, ChuClone.model.Constants.PLAYER.HEIGHT, ChuClone.model.Constants.PLAYER.DEPTH);

		// Create the entity and set it's body and view
		var entity = new ChuClone.GameEntity();
		entity.setBody(body);
		entity.setView(view);

		// Position it at the respawn point
		body.SetPosition(new Box2D.Common.Math.b2Vec2(respawnPoint.attachedEntity.getBody().GetPosition().x, respawnPoint.attachedEntity.getBody().GetPosition().y - 1));

		// Modify the material
		entity.setDimensions(ChuClone.model.Constants.PLAYER.WIDTH, ChuClone.model.Constants.PLAYER.HEIGHT, ChuClone.model.Constants.PLAYER.DEPTH);

		// Set the main component of a player - CharacterControllerComponent
		entity.addComponentAndExecute(new ChuClone.components.player.CharacterControllerComponent());

		// Add it to the scene
		gameViewController.addObjectToScene(entity.view);
		return entity;
	};
    ChuClone.extend( ChuClone.components.player.CharacterControllerComponent, ChuClone.components.BaseComponent );
})();