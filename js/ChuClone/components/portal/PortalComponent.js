/**
File:
	PortalComponent.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	A portal component teleports the player to the connected portal while maintaining their velocity

 Basic Usage:

 License:
   Creative Commons Attribution-NonCommercial-ShareAlike
   http://creativecommons.org/licenses/by-nc-sa/3.0/
*/
(function(){
    "use strict";
	ChuClone.namespace("ChuClone.components.portal");

	// TRACK RESPAWN POINTS INTERNALLY
    /**
     * @type {Array}
     */
    var __portalPoints = [];
    /**
     * @type {ChuClone.components.portal.PortalComponent}
     */
    var __currentPortalPoint = null;
    /**
     *  Removes a PortalPoint
     *  @param {ChuClone.components.portal.PortalComponent}
     */
    var __removePortalPoint = function( aPortalPoint ) {

        if(__currentPortalPoint == aPortalPoint) {
            __currentPortalPoint = null;
        }
    
        var len = __portalPoints.length;
        for (var i = 0; i < len; ++i) {
            if (__portalPoints[i] === aPortalPoint) {
                __portalPoints.splice(i, 1);
                return;
            }
        }
    };

    /**
     * Adds a respawn point to our internal array
     * @param {ChuClone.components.portal.PortalComponent} aPortalPoint
     */
    var __addPortalPoint = function( aPortalPoint ) {

        // Check if the one before this one, and the one passed both don't have mirrors
        // If they don't... Create a relationship between them
        if( __portalPoints[__portalPoints.length-1 ] ) {
            var otherPortal = __portalPoints[__portalPoints.length - 1];
            if( !otherPortal.getMirror() && !aPortalPoint.getMirror() ) {
                __createRelationship( otherPortal, aPortalPoint );
            }
        }
        __portalPoints.push(aPortalPoint);
    };

    /**
     * Creates a relationship between two portals
     * If force is true, destroys any existing relationship
     *
     * @param {ChuClone.components.portal.PortalComponent} portalA
     * @param {ChuClone.components.portal.PortalComponent} portalB
     * @param {Boolean} force
     */
    var __createRelationship = function( portalA, portalB ) {
        if( portalA.getMirror() || portalB.getMirror() ) {
            console.log("Destroying relationship for portalA or portalB!");
        }

        portalA.setMirror( portalB );
        portalB.setMirror( portalA );
    };


	ChuClone.components.portal.PortalComponent = function() {
		ChuClone.components.portal.PortalComponent.superclass.constructor.call(this);
        this._angle = 0;
		this._inactiveList = {};
		this._isActive = true;
		this.__isReady = true;
		//this._inactiveList = [];
	};

	ChuClone.components.portal.PortalComponent.prototype = {
		displayName		: "PortalComponent",					// Unique string name for this Trait

        /**
         * @type {String}
         */
        _textureSource	: "assets/images/game/floor.png",

        /**
         * @type {Object}
         */
		_previousDimensions : null,

        /**
         * Portals are always linked.
         * If a portal does not have an 'otherPortal' property - it does nothing on collision
         * @type {ChuClone.components.portal.PortalComponent}
         */
        _mirror         : null,

        /**
         * @type {Number}
         */
        _mirrorId       : 0,

        /**
         * @type {Number}
         */
        _angle          : 0,

        /**
         * @type {THREE.Mesh}
         */
        _pointer  : null,

        /**
         * @type {ChuClone.components.effect.ParticleEmitterComponent}
         */
        _particleController : null,


		/**
		 * If false, the portal is disabled
		 * @type {Boolean}
		 */
        _isActive                        : true,

        /**
         * How long to wait before being considered ready again
         * @type {Number}
         */
        _inactiveDelay                  : 150,

         /**
		 * Overwrite to allow component specific GUI
		 */
		_editableProperties: {angle: {value: 90, min: 0, max: 360, step: 10}},

        EVENTS: {
            CREATED     : "ChuClone.components.portal.PortalComponent.events.CREATED",
            DESTROYED   : "ChuClone.components.portal.PortalComponent.events.DESTROYED"
        },

		/**
		 * @inheritDoc
		 */
		attach: function(anEntity) {
			ChuClone.components.portal.PortalComponent.superclass.attach.call(this, anEntity);
			__addPortalPoint( this );


			this.attachedEntity.getBody().GetFixtureList().SetSensor( true );
			this.attachedEntity.getBody().SetBullet( true );
			this._previousDimensions = this.attachedEntity.getDimensions();
			this.attachedEntity.setDimensions( this._previousDimensions.width, ChuClone.model.Constants.PTM_RATIO/4, this._previousDimensions.depth );

            // Particle component
            this._particleController = new ChuClone.components.effect.ParticleEmitterComponent();
            this.attachedEntity.addComponentAndExecute( this._particleController );

            // Intercept collision
            this.intercept(['onCollision', 'setBody']);

            if(ChuClone.model.Constants.IS_EDIT_MODE) {
                //this.setupDebug();
            }
		},

        /**
         * Creates a cube that we re-orientate to show us the direction we're traveling in
         */
        setupDebug: function() {
            this.requiresUpdate = true;
        },


		/**
		 * @inheritDoc
		 */
        execute: function() {
            ChuClone.components.portal.PortalComponent.superclass.execute.call(this);

            var view = this.attachedEntity.getView();
            var body = this.attachedEntity.getBody();

            // Swap materials
            this._previousMaterial = view.materials[0];
            view.materials[0] = new THREE.MeshLambertMaterial( {
						opacity: 0.65,
						color: 0xFFFFFF,
						transparent: true,
						shading: THREE.SmoothShading,
						map : ChuClone.utils.TextureUtils.GET_TEXTURE( ChuClone.model.Constants.SERVER.ASSET_PREFIX + this._textureSource )
            });
        },

        /**
         * Debug update, orientate our debugpoint to show us where we're facing
         */
        update: function() {
            var direction = this.getDirection();

            this._pointer.position = this.attachedEntity.getView().position.clone();

            var scalar = 100;
            var pointPosition = this.attachedEntity.getView().position.clone();
            pointPosition.x += direction.x * scalar;
            pointPosition.y += direction.y * scalar;
            this._pointer.position = pointPosition;

            var newRotation = this.attachedEntity.getView().rotation.clone();
            var glide = 0.1;
            this._pointer.rotation.x = newRotation.x
            this._pointer.rotation.y -= (this._pointer.rotation.y - newRotation.y) * glide;
            this._pointer.rotation.z -= (this._pointer.rotation.z - newRotation.z) * glide;
        },

		/**
		 * Override oncollision to set this as the current respawn point
		 */
        onCollision: function( otherActor ) {

            // Other actor is not a player, or we don't have a mirror - nothing to do!
            if( !otherActor || otherActor._type != ChuClone.model.Constants.ENTITY_TYPES.PLAYER || !this.getMirror() )
                return;

            // Not ready or mirror is not ready!
            if( !this.getIsReady( otherActor.getId() ) || !this.getMirror().getIsReady( otherActor.getId() ) ) {
              	console.log("NotReady!");
                return;
            }


            // Check if the portal and player are facing opposite directions using the dot product
            var direction = this.getDirection();
            var playerPosition = otherActor.getBody().GetPosition().Copy();
			var playerToPortal = new Box2D.Common.Math.b2Vec2(playerPosition.x - this.attachedEntity.getBody().GetPosition().x, playerPosition.y - this.attachedEntity.getBody().GetPosition().y);
			playerToPortal.Normalize();
            var dot = Box2D.Common.Math.b2Math.Dot( direction, playerToPortal );

            // Player is attempting to enter from back area, ignore collision
            if( dot > 0.2 ) {
                console.log("Bad Dot!:", Math.round(dot*10000)/10000);
                //return;
            }

            // this.interceptedProperties.onCollision.call(this.attachedEntity, otherActor );

			// Get the players speed, but if its less than 12, make it 12 to avoid infinately entering portals
			var playerVelocity = otherActor.getBody().GetLinearVelocity().Copy();
            var playerSpeed = Math.abs(playerVelocity.x) + Math.abs(playerVelocity.y);
			playerSpeed = Math.max(playerSpeed, 12);

            this.onPlayerEnterPortal( otherActor, playerSpeed );
        },

        /**
         * Called by us when a player has successfully entered this portal.
         * @param {ChuClone.GameEntity} playerActor
         * @param {Number} playerSpeed Combined linear velocity of the player
         */
        onPlayerEnterPortal: function( playerActor, playerSpeed ) {
            var that = this;

            playerActor.getBody().SetType(Box2D.Dynamics.b2Body.b2_kinematicBody);

            // Stop checking the X/Y velocity until this player hits something
            playerActor.addComponentAndExecute( new ChuClone.components.AntiPhysicsVelocityLimitComponent() );
            
            // We have to do it 'next frame' because box2d locks all these properties during a collision
            setTimeout( function() { that.getMirror().onPlayerExitPortal( playerActor, playerSpeed ); }, 1);

			ChuClone.Events.Dispatcher.emit(
					ChuClone.controller.AudioController.prototype.EVENTS.SHOULD_PLAY_SOUND,
					ChuClone.model.Constants.SOUNDS.PORTAL_ENTER.id);

            this.startWaitingForIsReady( playerActor.getId() );
        },

        /**
         * Called by us when a player has successfully entered this portal.
         * @param {ChuClone.GameEntity} playerActor
         * @param {Number} playerSpeed Combined linear velocity of the player
         */
        onPlayerExitPortal: function( playerActor, playerSpeed ) {

            this.startWaitingForIsReady( playerActor.getId() );
            playerActor.getBody().SetPosition( this.attachedEntity.getBody().GetPosition().Copy() );

			// Make player imaterial for one frame
			setTimeout( function(){
				playerActor.getBody().SetType(Box2D.Dynamics.b2Body.b2_dynamicBody);
			}, 16);

            // Set the players new velocity to match the direction this portal is facing
            var directionVector = this.getDirection();
            directionVector.Multiply( playerSpeed );
            directionVector.x *= -1; // Flip X for box2d
            directionVector.y *= -1; // Flip Y for box2d
            playerActor.getBody().SetLinearVelocity( directionVector );
        },

         /**
         * Once set _isActive is locked for N milliseconds
         */
        startWaitingForIsReady: function( entityId ) {
			 var that = this;
			 this.__isReady = false;

			 this._inactiveList[entityId] = Date.now();

			 clearTimeout( this._inactiveTimeout );
			 this._inactiveTimeout = setTimeout(function() {
                 that._inactiveList[entityId] = null;
			 }, this._inactiveDelay);
        },


        /**
         * Override the setBody function of the entity, to turn this entity's b2Body into a 'sensor' type
         * @param aBody
         */
        setBody: function( aBody ) {
            this.interceptedProperties.setBody.call(this.attachedEntity, aBody );
            this.attachedEntity.getBody().GetFixtureList().SetSensor( true );
        },

        /**
         * Restore material and restitution
         */
        detach: function() {
			__removePortalPoint( this );
            this.attachedEntity.getView().materials[0] = this._previousMaterial;

            if( this._pointer ) {
                this._pointer.parent.removeChild( this._pointer );
                this._pointer = null;
            }


            var aParticleEmitterComponent = this.attachedEntity.getComponentWithName(ChuClone.components.effect.ParticleEmitterComponent.prototype.displayName);
            if( aParticleEmitterComponent == this._particleController ) {
                this.attachedEntity.removeComponentWithName( ChuClone.components.effect.ParticleEmitterComponent.prototype.displayName );
                this._particleController = null;
            }

            ChuClone.components.portal.PortalComponent.superclass.detach.call(this);
        },

        /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.portal.PortalComponent.superclass.getModel.call(this);
            returnObject.textureSource = this._textureSource;
            returnObject.mirrorId = this._mirrorId;
            returnObject.angle = this._angle;

            return returnObject;
        },

		/**
		 * @inheritDoc
		 */
        fromModel: function( data, futureEntity ) {
			ChuClone.components.portal.PortalComponent.superclass.fromModel.call(this, data);
            this._textureSource = data.textureSource;
            this._mirrorId  = data._mirrorId || 0;
            this._angle = data.angle || 0;
		},

        ///// EDITABLE PROPERTIES
        /**
         * Set the '_editableProperties' object to our values
         */
        setEditableProps: function() {
			this._editableProperties.angle.value = this._angle;
        },

        /**
		 * Modify the texture to face left or right
		 */
		onEditablePropertyWasChanged: function() {
			this.setAngle( this._editableProperties.angle.value );
		},

        ///// ACCESSORS
        getIsReady: function( entityId ) {
			return this._isActive
                && this._inactiveList[entityId] == null;
        },
        
		setIsActive: function( aValue ) {
			this._isActive = aValue;
			this.attachedEntity.getView().visible = aValue;
			this._particleController.setVisible( aValue );
		},
		getIsActive: function( ) { return this._isActive; },
        /**
         * @return {ChuClone.components.portal.PortalComponent}
         */
        getMirror: function() { return this._mirror },

        /**
         * @param {ChuClone.components.portal.PortalComponent} aPortal
         */
        setMirror: function(aPortal) { this._mirror = aPortal; },
		/**
		 * Sets the angle this portal is facing
		 * @param {Number} aColor
		 */
		setAngle: function( anAngle ) {
			this._angle = anAngle;
			this.attachedEntity.getBody().SetAngle( this._angle * Math.PI/180 );
		},
		/**
		 * Sets the material color for the portal
		 * @param {Number} aColor
		 */
		setColor: function( aColor ) {
			this.attachedEntity.getView().materials[0].color = new THREE.Color( aColor );
			this._particleController.setColor( aColor );
		},

        /**
         * @return {Box2D.Common.Math.b2Vec2} direction
         */
        getDirection: function() {
            var angleInRadians = (this._angle * Math.PI/180) + Math.PI/2; // +90 degrees in radians
            
            var normalizedPosition = this.attachedEntity.getBody().GetPosition().Copy();
            normalizedPosition.Normalize();
            normalizedPosition.x = Math.cos( angleInRadians );
            normalizedPosition.y = Math.sin( angleInRadians );
            return normalizedPosition;
        }
	};

    ChuClone.extend( ChuClone.components.portal.PortalComponent, ChuClone.components.BaseComponent );
})();